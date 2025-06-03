const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const XLSX = require('xlsx');
const mammoth = require('mammoth');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Configure multer for PDF uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// Handle PDF upload
app.post('/upload-pdf', upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);

        // Extract dates from PDF content
        const events = extractDatesFromText(data.text);

        res.json({
            success: true,
            filename: req.file.filename,
            events: events
        });
    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Handle PDF deletion
app.delete('/delete-pdf/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'uploads', filename);

    fs.unlink(filepath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete file'
            });
        }

        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    });
});

// Schedule upload endpoint
app.post('/api/upload-schedule', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const fileType = path.extname(req.file.originalname).toLowerCase();
        let events = [];

        // Process file based on type
        switch (fileType) {
            case '.xlsx':
            case '.xls':
                events = await processExcelSchedule(filePath);
                break;
            case '.pdf':
                events = await processPDFSchedule(filePath);
                break;
            case '.doc':
            case '.docx':
                events = await processWordSchedule(filePath);
                break;
            default:
                throw new Error('Unsupported file type');
        }

        res.json({ events });

    } catch (error) {
        console.error('Error processing schedule:', error);
        res.status(500).json({ error: 'Failed to process schedule' });
    }
});

// Process Excel schedule
async function processExcelSchedule(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    return data.map(row => ({
        title: row.Title || 'Shift',
        start: new Date(row.Start),
        end: new Date(row.End),
        description: row.Description || '',
        backgroundColor: '#2196f3'
    }));
}

// Process PDF schedule
async function processPDFSchedule(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    // Here you would implement your PDF parsing logic
    // This is a simplified example
    const events = [];
    const lines = data.text.split('\n');
    
    for (const line of lines) {
        const match = line.match(/(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})\s+(.+)/);
        if (match) {
            const [_, date, startTime, endTime, title] = match;
            events.push({
                title: title.trim(),
                start: new Date(`${date} ${startTime}`),
                end: new Date(`${date} ${endTime}`),
                backgroundColor: '#2196f3'
            });
        }
    }
    
    return events;
}

// Process Word schedule
async function processWordSchedule(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value;
    
    // Here you would implement your Word document parsing logic
    // This is a simplified example
    const events = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
        const match = line.match(/(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})\s+(.+)/);
        if (match) {
            const [_, date, startTime, endTime, title] = match;
            events.push({
                title: title.trim(),
                start: new Date(`${date} ${startTime}`),
                end: new Date(`${date} ${endTime}`),
                backgroundColor: '#2196f3'
            });
        }
    }
    
    return events;
}

// Function to extract dates from PDF text
function extractDatesFromText(text) {
    const events = [];
    
    // Regular expression for date patterns (customize based on your PDF format)
    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/g;
    
    let match;
    while ((match = datePattern.exec(text)) !== null) {
        const date = new Date(match[1]);
        if (!isNaN(date)) {
            // Create an event for each found date
            events.push({
                title: 'Schedule Event',
                start: date.toISOString().split('T')[0],
                end: date.toISOString().split('T')[0]
            });
        }
    }

    return events;
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 