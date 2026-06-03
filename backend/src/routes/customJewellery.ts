import { Router } from 'express';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const router = Router();
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'consultations.json');

// Ensure data directory exists
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  if (!existsSync(DATA_FILE)) {
    await writeFile(DATA_FILE, JSON.stringify([]));
  }
}

// Read consultations from file
async function readConsultations() {
  await ensureDataDir();
  const data = await readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

// Write consultations to file
async function writeConsultations(consultations: any[]) {
  await ensureDataDir();
  await writeFile(DATA_FILE, JSON.stringify(consultations, null, 2));
}

// Get all consultation requests (Admin only)
router.get('/', async (req, res) => {
  try {
    const consultations = await readConsultations();
    res.json({ success: true, data: consultations });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch consultations' });
  }
});

// Create new consultation request
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, category, message } = req.body;

    if (!name || !email || !phone || !category || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }

    const consultations = await readConsultations();
    
    const consultation = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      category,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    consultations.push(consultation);
    await writeConsultations(consultations);

    res.status(201).json({ 
      success: true, 
      message: 'Consultation request submitted successfully',
      data: consultation 
    });
  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({ success: false, error: 'Failed to submit consultation request' });
  }
});

// Update consultation status (Admin only)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const consultations = await readConsultations();
    const index = consultations.findIndex((c: any) => c.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Consultation not found' });
    }

    consultations[index] = {
      ...consultations[index],
      status,
      ...(notes && { notes })
    };

    await writeConsultations(consultations);

    res.json({ success: true, data: consultations[index] });
  } catch (error) {
    console.error('Error updating consultation:', error);
    res.status(500).json({ success: false, error: 'Failed to update consultation' });
  }
});

// Delete consultation request (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const consultations = await readConsultations();
    const filtered = consultations.filter((c: any) => c.id !== id);
    
    await writeConsultations(filtered);
    
    res.json({ success: true, message: 'Consultation deleted successfully' });
  } catch (error) {
    console.error('Error deleting consultation:', error);
    res.status(500).json({ success: false, error: 'Failed to delete consultation' });
  }
});

export default router;
