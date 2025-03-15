// Main navigation and tool loading with strong isolation
document.addEventListener('DOMContentLoaded', function() {
    const toolItems = document.querySelectorAll('.tool-item');
    const toolContainer = document.getElementById('tool-container');
    
    // Current active tool
    let currentTool = 'jwt-editor'; // Default tool
    let activeToolFrame = null;
    
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
            
            // Create a complete HTML document for the iframe
            const iframeContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${toolId}</title>
                    <link rel="stylesheet" href="/css/main.css">
                    <link rel="stylesheet" href="/css/components.css">
                    <style>${css}</style>
                </head>
                <body>
                    <div class="tool-container">
                        ${html}
                    </div>
                    <script>
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
                        const jwtEditorResponse = await fetch(`/tools/${toolId}/scripts/jwtEditor.js`);
                        
                        if (jwtUtilsResponse.ok && jwtEditorResponse.ok) {
                            const jwtUtils = await jwtUtilsResponse.text();
                            const jwtEditor = await jwtEditorResponse.text();
                            
                            // Replace imports with actual code (simplified approach)
                            script = `
                                // Inlined JWT Utils
                                ${jwtUtils.replace('export function', 'function')}
                                
                                // Inlined JWT Editor
                                ${jwtEditor.replace('import {', '// import {')}
                                
                                // Initialize JWT Editor
                                document.addEventListener('DOMContentLoaded', function() {
                                    jwtEditor();
                                });
                            `;
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
});
