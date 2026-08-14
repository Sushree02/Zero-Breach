import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://zero-breach-backend.onrender.com';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

function extractErrorMessage(err) {
  if (err.response && err.response.data && err.response.data.error) {
    return err.response.data.error;
  }
  if (err.code === 'ECONNABORTED') {
    return 'The investigation is taking longer than expected. Please try again.';
  }
  return 'Something went wrong while reaching the backend. Please try again.';
}

export async function investigateDomain(target) {
  try {
    const { data } = await client.post('/investigate/domain', { target });
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function investigateIP(target) {
  try {
    const { data } = await client.post('/investigate/ip', { target });
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function investigateUsername(target) {
  try {
    const { data } = await client.post('/investigate/username', { target });
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function investigateFile(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await client.post('/investigate/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // file upload + VirusTotal analysis can take longer than a text lookup
    });
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function downloadReport(investigationResult) {
  try {
    const response = await client.post('/report', investigationResult, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ZeroBreach-Report-${investigationResult.target}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    throw new Error('Failed to generate the PDF report. Please try again.');
  }
}

export async function checkHealth() {
  const { data } = await client.get('/health');
  return data;
}
