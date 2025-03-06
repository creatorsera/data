const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const fileList = document.getElementById('file-list');
        let files = [];

        // Handle file selection
        fileInput.addEventListener('change', handleFileSelect);
        
        // Drag and drop handlers
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            handleFileSelect(e.dataTransfer.files);
        });

        // Handle both input and drop files
        function handleFileSelect(selectedFiles) {
            files = [...files, ...selectedFiles];
            renderFileList();
        }

        // Render file list
        function renderFileList() {
            fileList.innerHTML = files.map((file, index) => `
                <div class="file-item">
                    <span>${file.name} (${formatFileSize(file.size)})</span>
                    <button class="secondary-btn" onclick="removeFile(${index})">Remove</button>
                </div>
            `).join('');
        }

        // Remove single file
        function removeFile(index) {
            files.splice(index, 1);
            renderFileList();
        }

        // Clear all files
        function clearFiles() {
            files = [];
            renderFileList();
        }

        // Merge CSV files
        async function mergeFiles() {
            if (files.length === 0) {
                alert('Please select at least one CSV file');
                return;
            }

            let mergedContent = '';
            let headers = null;

            for (const file of files) {
                const text = await readFile(file);
                const [header, ...rows] = text.split('\n');

                if (!headers) {
                    headers = header;
                    mergedContent = header + '\n';
                }

                mergedContent += rows.join('\n') + '\n';
            }

            downloadCSV(mergedContent);
        }

        // Read file content
        function readFile(file) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsText(file);
            });
        }

        // Download merged CSV
        function downloadCSV(content) {
            const blob = new Blob([content], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `merged-${Date.now()}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        }

        // Format file size
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
