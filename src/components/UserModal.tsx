import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, FormGroup, FormInput, FormSelect, FormRow, BtnPrimary, BtnGhost } from './ui/Modal';

interface UserModalProps {
  open: boolean;
  onClose: () => void;
}

export function UserModal({ open, onClose }: UserModalProps) {
  const { addUser, showToast } = useApp();
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'member' | 'viewer'>('member');
  const [dept, setDept] = useState('');

  function handleSave() {
    if (!fname.trim() || !lname.trim() || !email.trim()) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    addUser({ fname: fname.trim(), lname: lname.trim(), email: email.trim(), role, dept: dept.trim() });
    showToast(`📨 Invite sent to ${fname} ${lname}`, 'success');
    setFname(''); setLname(''); setEmail(''); setRole('member'); setDept('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="👤 Invite Team Member"
      footer={
        <>
          <BtnGhost onClick={onClose}>Cancel</BtnGhost>
          <BtnPrimary onClick={handleSave}>Send Invite</BtnPrimary>
        </>
      }
    >
      <FormRow>
        <FormGroup label="First Name *">
          <FormInput value={fname} onChange={e => setFname(e.target.value)} placeholder="Alex" autoFocus />
        </FormGroup>
        <FormGroup label="Last Name *">
          <FormInput value={lname} onChange={e => setLname(e.target.value)} placeholder="Johnson" />
        </FormGroup>
      </FormRow>

      <FormGroup label="Email *">
        <FormInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@company.com" />
      </FormGroup>

      <FormRow>
        <FormGroup label="Role">
          <FormSelect value={role} onChange={e => setRole(e.target.value as typeof role)}>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </FormSelect>
        </FormGroup>
        <FormGroup label="Department">
          <FormInput value={dept} onChange={e => setDept(e.target.value)} placeholder="Engineering" />
        </FormGroup>
      </FormRow>
    </Modal>
  );
}
