// Main navigation and tool loading with strong isolation and proper cleanup
document.addEventListener('DOMContentLoaded', function() {
    const toolItems = document.querySelectorAll('.tool-item');
    const toolContainer = document.getElementById('tool-container');
    
    // Current active tool
    let currentTool = 'jwt-editor'; // Default tool
    let activeToolFrame = null;
    let cleanupFunctions = new Map(); // Store cleanup functions for each tool
    
    // Load the default tool on page load
    loadTool(currentTool);
    
    // Tool navigation
    toolItems.forEach(item => {
        item.addEventListener('click', () => {
            // Skip if already active
            if (item.classList.contains('active')) return;
            
            // Update active state
            toolItems.forEach(t => t.classList.remove('active'));
            item.classList.add('active');
            
            // Get the tool ID and load it
            const toolId = item.getAttribute('data-tool');
            loadTool(toolId);
        });
    });
    
    // Function to load a tool using iframe isolation
    function loadTool(toolId) {
        console.log(`Loading tool: ${toolId}`);
        
        // Run cleanup for the previous tool if it exists
        if (currentTool && cleanupFunctions.has(currentTool)) {
            try {
                cleanupFunctions.get(currentTool)();
                console.log(`Cleaned up resources for: ${currentTool}`);
            } catch (e) {
                console.error(`Error during cleanup for ${currentTool}:`, e);
            }
        }
        
        // Remove any existing tool frames
        if (activeToolFrame) {
            activeToolFrame.remove();
            activeToolFrame = null;
        }
        
        // Update the current tool
        currentTool = toolId;
        
        // Create an iframe for complete isolation
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.title = `${toolId} tool`;
        iframe.id = `tool-frame-${toolId}`;
        
        // Add the iframe to the container
        toolContainer.innerHTML = '';
        toolContainer.appendChild(iframe);
        activeToolFrame = iframe;
        
        // Construct HTML content with all necessary resources
        fetchToolResources(toolId).then(resources => {
            const { html, css, script } = resources;
            
            // Preload CSS by creating a link element in the parent document
            const styleLink = document.createElement('link');
            styleLink.rel = 'stylesheet';
            styleLink.href = `/tools/${toolId}/style.css`;
            document.head.appendChild(styleLink);
            
            // Create a complete HTML document for the iframe with CSS loaded via link
            const iframeContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${toolId}</title>
                    <link rel="stylesheet" href="/css/main.css">
                    <link rel="stylesheet" href="/css/components.css">
                    <link rel="stylesheet" href="/tools/${toolId}/style.css">
                    <!-- Fallback inline styles in case the link fails to load -->
                    <style>
                        ${css}
                    </style>
                </head>
                <body>
                    <div class="tool-container">
                        ${html}
                    </div>
                    <script>
                        // Tool cleanup registration
                        window.cleanupFunctions = [];
                        window.registerToolCleanup = function(cleanupFn) {
                            if (typeof cleanupFn === 'function') {
                                window.cleanupFunctions.push(cleanupFn);
                            }
                        };
                        
                        // Isolated tool script
                        ${script}
                    </script>
                </body>
                </html>
            `;
            
            // Set the iframe content
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(iframeContent);
            iframeDoc.close();
            
            // Handle copy button functionality which requires access to parent document
            iframe.contentWindow.navigator.clipboard = navigator.clipboard;
            
            // Register a master cleanup function for this tool
            cleanupFunctions.set(toolId, function() {
                // Execute all registered cleanup functions for this tool
                if (iframe.contentWindow && iframe.contentWindow.cleanupFunctions) {
                    iframe.contentWindow.cleanupFunctions.forEach(fn => {
                        try {
                            fn();
                        } catch (e) {
                            console.error('Error in cleanup function:', e);
                        }
                    });
                }
                
                // Remove the preloaded style link from the parent document
                if (styleLink && styleLink.parentNode) {
                    styleLink.parentNode.removeChild(styleLink);
                }
                
                // Clear references to potentially leak-causing objects
                if (iframe.contentWindow) {
                    iframe.contentWindow.onunload = null;
                    iframe.contentWindow.onload = null;
                    iframe.onload = null;
                    iframe.contentWindow.document.body.innerHTML = '';
                }
            });
            
        }).catch(error => {
            console.error(`Error loading tool ${toolId}:`, error);
            toolContainer.innerHTML = `
                <div class="tool-header">
                    <h1>Error Loading Tool</h1>
                    <p>There was an error loading the requested tool. Please try again later.</p>
                </div>
            `;
        });
    }
    
    // Function to fetch all tool resources (HTML, CSS, JS)
    async function fetchToolResources(toolId) {
        try {
            // Fetch HTML
            const htmlResponse = await fetch(`/tools/${toolId}/index.html`);
            if (!htmlResponse.ok) throw new Error(`Failed to load HTML for tool ${toolId}`);
            const html = await htmlResponse.text();
            
            // Fetch CSS
            const cssResponse = await fetch(`/tools/${toolId}/style.css`);
            let css = '';
            if (cssResponse.ok) {
                css = await cssResponse.text();
            }
            
            // Fetch JavaScript - handle module scripts separately
            const scriptResponse = await fetch(`/tools/${toolId}/script.js`);
            let script = '';
            if (scriptResponse.ok) {
                script = await scriptResponse.text();
                
                // For JWT editor, also fetch and inline the module dependencies
                if (toolId === 'jwt-editor') {
                    try {
                        const jwtUtilsResponse = await fetch(`/tools/${toolId}/scripts/jwtUtils.js`);
                        if (jwtUtilsResponse.ok) {
                            const jwtUtils = await jwtUtilsResponse.text();
                            script = jwtUtils + "\n" + script;
                        }
                        
                        const jwtEditorResponse = await fetch(`/tools/${toolId}/scripts/jwtEditor.js`);
                        if (jwtEditorResponse.ok) {
                            const jwtEditor = await jwtEditorResponse.text();
                            // Add initialization code at the end
                            script = script + "\n" + jwtEditor + "\n" + 
                                "// Initialize JWT Editor\n" +
                                "document.addEventListener('DOMContentLoaded', function() {\n" +
                                "    jwtEditor();\n" +
                                "});\n";
                        }
                    } catch (e) {
                        console.error('Error fetching JWT modules:', e);
                    }
                }
            }
            
            return { html, css, script };
        } catch (error) {
            console.error('Error fetching tool resources:', error);
            throw error;
        }
    }
    
    // Clean up everything when the page is unloaded
    window.addEventListener('beforeunload', function() {
        cleanupFunctions.forEach((cleanup, toolId) => {
            try {
                cleanup();
                console.log(`Cleaned up resources for: ${toolId}`);
            } catch (e) {
                console.error(`Error during cleanup for ${toolId}:`, e);
            }
        });
    });
});
