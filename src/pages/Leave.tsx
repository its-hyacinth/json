import { useState } from 'react';
import { format } from 'date-fns';

interface LeaveRequest {
  id: number;
  officerId: number;
  startDate: Date;
  endDate: Date;
  type: string;
  hours: number;
  status: 'pending' | 'approved' | 'rejected';
  attachmentUrl?: string;
  signature?: string;
}

const Leave = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [leaveType, setLeaveType] = useState('');
  const [hours, setHours] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [signature, setSignature] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const steps = ['Request Details', 'Documentation', 'Review & Submit'];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const checkConflicts = () => {
    if (!startDate || !endDate) return false;
    
    return requests.some(request => {
      const requestStart = new Date(request.startDate);
      const requestEnd = new Date(request.endDate);
      return (
        (startDate >= requestStart && startDate <= requestEnd) ||
        (endDate >= requestStart && endDate <= requestEnd)
      );
    });
  };

  const handleSubmit = () => {
    if (checkConflicts()) {
      setError('Conflict detected with existing leave requests');
      return;
    }

    if (!startDate || !endDate || !leaveType || !hours) {
      setError('Please fill in all required fields');
      return;
    }

    const newRequest: LeaveRequest = {
      id: requests.length + 1,
      officerId: 123, // Replace with actual officer ID
      startDate: startDate,
      endDate: endDate,
      type: leaveType,
      hours: Number(hours),
      status: 'pending',
      attachmentUrl: file ? URL.createObjectURL(file) : undefined,
      signature: signature,
    };

    setRequests([...requests, newRequest]);
    resetForm();
  };

  const resetForm = () => {
    setStartDate(null);
    setEndDate(null);
    setLeaveType('');
    setHours('');
    setFile(null);
    setSignature('');
    setActiveStep(0);
    setError(null);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  return (
    <div>
      <h1 style={{ color: 'var(--text-primary)', marginBottom: '24px' }}>Leave Request</h1>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        {/* Stepper */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          {steps.map((label, index) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: index <= activeStep ? 'var(--text-accent)' : 'var(--glass-bg-light)',
                color: index <= activeStep ? 'var(--text-primary)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '8px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {index + 1}
              </div>
              <span style={{ color: index <= activeStep ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
              {index < steps.length - 1 && (
                <div style={{
                  width: '40px',
                  height: '2px',
                  backgroundColor: index < activeStep ? 'var(--text-accent)' : 'var(--glass-border)',
                  margin: '0 16px'
                }} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="glass-card" style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'var(--glass-danger)', color: 'var(--text-primary)' }}>
            {error}
          </div>
        )}

        {activeStep === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Start Date</label>
              <input
                type="date"
                value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                className="glass-input"
              />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>End Date</label>
              <input
                type="date"
                value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                className="glass-input"
              />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Leave Type</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="glass-input"
              >
                <option value="">Select Leave Type</option>
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="bereavement">Bereavement</option>
              </select>
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Hours Requested</label>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="glass-input"
              />
            </div>
          </div>
        )}

        {activeStep === 1 && (
          <div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Supporting Documents (PDF)</h3>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="glass-input"
              style={{ marginBottom: '16px' }}
            />
            <div>
              <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Digital Signature</label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Type your full name as signature"
                className="glass-input"
              />
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Review Request</h3>
            <div style={{ display: 'grid', gap: '8px', marginBottom: '24px' }}>
              <div style={{ color: 'var(--text-secondary)' }}>Start Date: {startDate ? format(startDate, 'MMM dd, yyyy') : 'Not set'}</div>
              <div style={{ color: 'var(--text-secondary)' }}>End Date: {endDate ? format(endDate, 'MMM dd, yyyy') : 'Not set'}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Leave Type: {leaveType}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Hours: {hours}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Attachment: {file ? file.name : 'None'}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Signature: {signature}</div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
          <button
            className="glass-btn"
            disabled={activeStep === 0}
            onClick={handleBack}
            style={{ opacity: activeStep === 0 ? 0.5 : 1 }}
          >
            Back
          </button>
          <div>
            <button
              className="glass-btn"
              onClick={resetForm}
              style={{ marginRight: '8px' }}
            >
              Reset
            </button>
            {activeStep === steps.length - 1 ? (
              <button
                className="glass-btn"
                onClick={handleSubmit}
              >
                Submit Request
              </button>
            ) : (
              <button
                className="glass-btn"
                onClick={handleNext}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Recent Requests</h2>
        {requests.map(request => (
          <div
            key={request.id}
            className="glass-card"
            style={{
              padding: '16px',
              marginBottom: '8px',
              backgroundColor: 'var(--glass-bg-light)',
              border: '1px solid var(--glass-border)'
            }}
          >
            <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '4px' }}>
              {format(request.startDate, 'MMM dd, yyyy')} - {format(request.endDate, 'MMM dd, yyyy')}
            </div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {request.type} - {request.hours} hours
            </div>
            <div
              style={{
                color: request.status === 'approved' ? 'var(--glass-success)' :
                      request.status === 'rejected' ? 'var(--glass-danger)' :
                      'var(--glass-warning)'
              }}
            >
              Status: {request.status.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leave; 