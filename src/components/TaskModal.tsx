import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task, Priority, Status, Tag, Quadrant } from '../types';
import { Modal, FormGroup, FormInput, FormSelect, FormTextarea, FormRow, BtnPrimary, BtnGhost } from './ui/Modal';
import { getUserName } from '../utils/helpers';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  editTask?: Task | null;
  defaultStatus?: Status;
  defaultQuadrant?: Quadrant;
}

const emptyForm = {
  title: '', desc: '',
  priority: 'medium' as Priority,
  status: 'todo' as Status,
  tag: 'work' as Tag,
  quadrant: 'q2' as Quadrant,
  due: new Date().toISOString().split('T')[0],
  assignedTo: 1,
  completed: false,
};

export function TaskModal({ open, onClose, editTask, defaultStatus, defaultQuadrant }: TaskModalProps) {
  const { users, addTask, updateTask, showToast } = useApp();
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    if (editTask) {
      setForm({
        title: editTask.title,
        desc: editTask.desc || '',
        priority: editTask.priority,
        status: editTask.status,
        tag: editTask.tag,
        quadrant: editTask.quadrant,
        due: editTask.due || new Date().toISOString().split('T')[0],
        assignedTo: editTask.assignedTo || 1,
        completed: editTask.completed,
      });
    } else {
      setForm({
        ...emptyForm,
        due: new Date().toISOString().split('T')[0],
        status: defaultStatus || 'todo',
        quadrant: defaultQuadrant || 'q2',
      });
    }
  }, [editTask, open, defaultStatus, defaultQuadrant]);

  function set(key: string, val: unknown) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function handleSave() {
    if (!form.title.trim()) { showToast('Task title is required', 'error'); return; }
    const data = {
      ...form,
      title: form.title.trim(),
      desc: form.desc.trim(),
      completed: form.status === 'done',
    };
    if (editTask) {
      updateTask(editTask.id, data);
      showToast('✅ Task updated', 'success');
    } else {
      addTask(data);
      showToast(`✅ Task "${form.title}" created`, 'success');
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editTask ? '✏️ Edit Task' : '✚ New Task'}
      footer={
        <>
          <BtnGhost onClick={onClose}>Cancel</BtnGhost>
          <BtnPrimary onClick={handleSave}>Save Task</BtnPrimary>
        </>
      }
    >
      <FormGroup label="Task Title *">
        <FormInput
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="What needs to be done?"
          autoFocus
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />
      </FormGroup>

      <FormGroup label="Description">
        <FormTextarea
          value={form.desc}
          onChange={e => set('desc', e.target.value)}
          placeholder="Add more details..."
        />
      </FormGroup>

      <FormRow>
        <FormGroup label="Priority">
          <FormSelect value={form.priority} onChange={e => set('priority', e.target.value)}>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </FormSelect>
        </FormGroup>
        <FormGroup label="Due Date">
          <FormInput type="date" value={form.due} onChange={e => set('due', e.target.value)} />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup label="Status">
          <FormSelect value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="todo">📋 To Do</option>
            <option value="inprogress">⚙️ In Progress</option>
            <option value="review">👁 In Review</option>
            <option value="done">✅ Done</option>
          </FormSelect>
        </FormGroup>
        <FormGroup label="Assign To">
          <FormSelect value={form.assignedTo} onChange={e => set('assignedTo', parseInt(e.target.value))}>
            {users.map(u => (
              <option key={u.id} value={u.id}>{getUserName(u)}</option>
            ))}
          </FormSelect>
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup label="Category">
          <FormSelect value={form.tag} onChange={e => set('tag', e.target.value)}>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="dev">Development</option>
            <option value="design">Design</option>
            <option value="review">Review</option>
            <option value="urgent">Urgent</option>
          </FormSelect>
        </FormGroup>
        <FormGroup label="Quadrant (Matrix)">
          <FormSelect value={form.quadrant} onChange={e => set('quadrant', e.target.value)}>
            <option value="q1">Q1 — Do (Urgent + Important)</option>
            <option value="q2">Q2 — Schedule (Not Urgent + Important)</option>
            <option value="q3">Q3 — Delegate (Urgent + Not Important)</option>
            <option value="q4">Q4 — Eliminate (Not Urgent + Not Important)</option>
          </FormSelect>
        </FormGroup>
      </FormRow>
    </Modal>
  );
}
