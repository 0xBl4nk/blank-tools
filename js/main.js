// Main navigation and tool loading
document.addEventListener('DOMContentLoaded', function() {
    const toolItems = document.querySelectorAll('.tool-item');
    const toolContainer = document.getElementById('tool-container');
    
    // Current active tool
    let currentTool = 'jwt-editor'; // Default tool
    
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
    
    // Function to load a tool
    function loadTool(toolId) {
        currentTool = toolId;
        
        // Load HTML content
        fetchToolHTML(toolId).then(html => {
            toolContainer.innerHTML = html;
            
            // Load CSS
            loadCSS(toolId);
            
            // Load JavaScript after HTML is loaded
            loadJS(toolId);
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
    
    // Function to fetch tool HTML
    async function fetchToolHTML(toolId) {
        const response = await fetch(`tools/${toolId}/index.html`);
        if (!response.ok) {
            throw new Error(`Failed to load HTML for tool ${toolId}`);
        }
        return await response.text();
    }
    
    // Function to load tool-specific CSS
    function loadCSS(toolId) {
        // Remove any previously loaded tool CSS
        const existingCSS = document.querySelector(`link[data-tool-css="${toolId}"]`);
        if (existingCSS) {
            existingCSS.remove();
        }
        
        // Create and add new CSS link
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = `tools/${toolId}/style.css`;
        cssLink.setAttribute('data-tool-css', toolId);
        document.head.appendChild(cssLink);
    }
    
    // Function to load tool-specific JavaScript
    function loadJS(toolId) {
        // Remove any previously loaded tool JS
        const existingJS = document.querySelector(`script[data-tool-js="${toolId}"]`);
        if (existingJS) {
            existingJS.remove();
        }
        
        // Create and add new script
        const script = document.createElement('script');
        script.src = `tools/${toolId}/script.js`;
        script.type = "module";
        script.setAttribute('data-tool-js', toolId);

        // script.onload = () => {
        //     script.type = 'module';
        // }
        document.body.appendChild(script);
    }
});
