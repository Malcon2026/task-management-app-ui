import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Task, User, Activity, Toast, View, ActivityType, ToastType } from '../types';
import { INITIAL_TASKS, INITIAL_USERS, INITIAL_ACTIVITIES, AVATAR_COLORS } from '../store';
import { getUserName } from '../utils/helpers';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AppContextType {
  tasks: Task[];
  users: User[];
  activities: Activity[];
  toasts: Toast[];
  currentView: View;
  sidebarCollapsed: boolean;
  activeUserId: number;
  activeUser: User | undefined;
  isLoading: boolean;

  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;

  setCurrentView: (v: View) => void;
  setSidebarCollapsed: (v: boolean) => void;
  switchUser: (id: number) => void;

  addTask: (t: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (idOrTask: number | Task, data?: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: number, status: Status) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleTask: (id: number) => Promise<void>;

  addUser: (u: Omit<User, 'id' | 'avatarClass' | 'status'>) => void;
  removeUser: (id: number) => void;

  addActivity: (type: ActivityType, userId: number, taskId: number | null, text: string, targetUserId?: number | null) => Promise<void>;
  clearActivities: () => Promise<void>;

  showToast: (msg: string, type?: ToastType) => void;
  removeToast: (id: number) => void;

  getUser: (id: number) => User | undefined;
  getTask: (id: number) => Task | undefined;

  nextTaskId: React.MutableRefObject<number>;
  nextUserId: React.MutableRefObject<number>;
  nextActivityId: React.MutableRefObject<number>;
}

function isTaskEqual(a: Task, b: Task) {
  return a.id === b.id && a.title === b.title && a.desc === b.desc &&
    a.priority === b.priority && a.status === b.status && a.tag === b.tag &&
    a.quadrant === b.quadrant && a.due === b.due && a.assignedTo === b.assignedTo &&
    a.completed === b.completed && a.createdAt === b.createdAt;
}

function isActivityEqual(a: Activity, b: Activity) {
  return a.id === b.id && a.type === b.type && a.userId === b.userId &&
    a.taskId === b.taskId && a.text === b.text && a.targetUserId === b.targetUserId &&
    a.time === b.time;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);

  // Authentication State
  const [sessionUserId, setSessionUserId] = useState<number | null>(() => {
    const saved = localStorage.getItem('taskflow_auth_user_id');
    return saved ? Number(saved) : null;
  });

  const [activeUserId, setActiveUserId] = useState<number>(() => sessionUserId || 1);

  const nextTaskId = useRef(100);
  const nextUserId = useRef(4);
  const nextActivityId = useRef(100);
  const toastId = useRef(1);

  const activeUser = users.find(u => u.id === activeUserId) || users[0];
  const isAuthenticated = sessionUserId !== null;

  const getUser = useCallback((id: number) => users.find(u => u.id === id), [users]);
  const getTask = useCallback((id: number) => tasks.find(t => t.id === id), [tasks]);

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    const id = toastId.current++;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const login = useCallback((email: string, pass: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (cleanPass !== 'Malcon@Malcon123') return false;

    const matchedUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!matchedUser) return false;

    setSessionUserId(matchedUser.id);
    setActiveUserId(matchedUser.id);
    localStorage.setItem('taskflow_auth_user_id', String(matchedUser.id));
    showToast(`🔒 Welcome back, ${getUserName(matchedUser)}!`, 'success');
    return true;
  }, [users, showToast]);

  const logout = useCallback(() => {
    setSessionUserId(null);
    localStorage.removeItem('taskflow_auth_user_id');
    showToast('👋 Logged out successfully', 'info');
  }, [showToast]);

  const switchUser = useCallback((id: number) => {
    const targetUser = users.find(u => u.id === id);
    if (targetUser) {
      setActiveUserId(id);
      showToast(`👤 Switched active account to ${getUserName(targetUser)}`, 'info');
    }
  }, [users, showToast]);

  // Load from Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    async function loadData() {
      try {
        setIsLoading(true);

        // Fetch Profiles (3 authorized users)
        const { data: dbProfiles, error: profError } = await supabase.from('profiles').select('*').order('id');
        if (!profError && dbProfiles && dbProfiles.length > 0) {
          setUsers(dbProfiles.map(p => ({
            id: Number(p.id),
            fname: p.fname,
            lname: p.lname || '',
            email: p.email,
            role: p.role,
            dept: p.dept || '',
            status: p.status || 'online',
            avatarClass: p.avatar_class || 'avatar-a',
          })));
        }

        // Fetch Tasks
        const { data: dbTasks, error: taskError } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
        if (!taskError && dbTasks) {
          setTasks(dbTasks.map(t => ({
            id: Number(t.id),
            title: t.title,
            desc: t.desc || '',
            priority: t.priority,
            status: t.status,
            tag: t.tag,
            quadrant: t.quadrant,
            due: t.due || '',
            assignedTo: Number(t.assigned_to) || 1,
            completed: Boolean(t.completed),
            createdAt: t.created_at ? new Date(t.created_at).getTime() : Date.now(),
          })));
        }

        // Fetch Activities
        const { data: dbActs, error: actError } = await supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(100);
        if (!actError && dbActs) {
          setActivities(dbActs.map(a => ({
            id: Number(a.id),
            type: a.type,
            userId: Number(a.user_id),
            taskId: a.task_id ? Number(a.task_id) : null,
            text: a.text,
            targetUserId: a.target_user_id ? Number(a.target_user_id) : null,
            time: a.created_at ? new Date(a.created_at).getTime() : Date.now(),
          })));
        }
      } catch (err) {
        console.error('Error fetching Supabase data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();

    // Setup Supabase Real-time Subscriptions
    const tasksChannel = supabase.channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, async () => {
        const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
        if (data) {
          setTasks(prev => {
            return data.map(t => {
              const n: Task = {
                id: Number(t.id),
                title: t.title,
                desc: t.desc || '',
                priority: t.priority,
                status: t.status,
                tag: t.tag,
                quadrant: t.quadrant,
                due: t.due || '',
                assignedTo: Number(t.assigned_to) || 1,
                completed: Boolean(t.completed),
                createdAt: t.created_at ? new Date(t.created_at).getTime() : Date.now(),
              };
              const p = prev.find(pt => pt.id === n.id);
              if (p && isTaskEqual(p, n)) return p;
              return n;
            });
          });
        }
      })
      .subscribe();

    const activitiesChannel = supabase.channel('public:activities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, async () => {
        const { data } = await supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(100);
        if (data) {
          setActivities(prev => {
            return data.map(a => {
              const n: Activity = {
                id: Number(a.id),
                type: a.type,
                userId: Number(a.user_id),
                taskId: a.task_id ? Number(a.task_id) : null,
                text: a.text,
                targetUserId: a.target_user_id ? Number(a.target_user_id) : null,
                time: a.created_at ? new Date(a.created_at).getTime() : Date.now(),
              };
              const p = prev.find(pa => pa.id === n.id);
              if (p && isActivityEqual(p, n)) return p;
              return n;
            });
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(activitiesChannel);
    };
  }, []);

  const addActivity = useCallback(async (type: ActivityType, userId: number, taskId: number | null, text: string, targetUserId: number | null = null) => {
    const time = Date.now();
    const newAct: Activity = { id: nextActivityId.current++, type, userId, taskId, text, targetUserId, time };
    setActivities(prev => [newAct, ...prev].slice(0, 100));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('activities').insert({
          type,
          user_id: userId,
          task_id: taskId,
          text,
          target_user_id: targetUserId,
        });
      } catch (e) {
        console.error('Supabase activity insert failed:', e);
      }
    }
  }, []);

  const addTask = useCallback(async (data: Omit<Task, 'id' | 'createdAt'>) => {
    const createdAt = Date.now();
    const localId = nextTaskId.current++;
    const newTask: Task = { ...data, id: localId, createdAt };
    setTasks(prev => [newTask, ...prev]);
    addActivity('create', activeUserId, localId, 'created task');

    if (isSupabaseConfigured) {
      try {
        const { data: dbResult, error } = await supabase.from('tasks').insert({
          title: data.title,
          desc: data.desc,
          priority: data.priority,
          status: data.status,
          tag: data.tag,
          quadrant: data.quadrant,
          due: data.due,
          assigned_to: data.assignedTo,
          completed: data.completed,
        }).select('id').single();

        if (!error && dbResult) {
          const createdId = Number(dbResult.id);
          setTasks(prev => prev.map(t => t.id === localId ? { ...t, id: createdId } : t));
        }
      } catch (e) {
        console.error('Supabase task insert failed:', e);
      }
    }
  }, [activeUserId, addActivity]);

  const updateTask = useCallback(async (idOrTask: number | Task, data?: Partial<Task>) => {
    let id: number;
    let updateData: Partial<Task>;

    if (typeof idOrTask === 'object' && idOrTask !== null) {
      id = idOrTask.id;
      updateData = idOrTask;
    } else {
      id = idOrTask;
      updateData = data || {};
    }

    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updateData } : t));
    addActivity('update', activeUserId, id, 'updated task');

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, any> = {};
        if (updateData.title !== undefined) payload.title = updateData.title;
        if (updateData.desc !== undefined) payload.desc = updateData.desc;
        if (updateData.priority !== undefined) payload.priority = updateData.priority;
        if (updateData.status !== undefined) payload.status = updateData.status;
        if (updateData.tag !== undefined) payload.tag = updateData.tag;
        if (updateData.quadrant !== undefined) payload.quadrant = updateData.quadrant;
        if (updateData.due !== undefined) payload.due = updateData.due;
        if (updateData.assignedTo !== undefined) payload.assigned_to = updateData.assignedTo;
        if (updateData.completed !== undefined) payload.completed = updateData.completed;

        if (Object.keys(payload).length > 0) {
          await supabase.from('tasks').update(payload).eq('id', id);
        }
      } catch (e) {
        console.error('Supabase task update failed:', e);
      }
    }
  }, [activeUserId, addActivity]);

  const updateTaskStatus = useCallback(async (id: number, status: Status) => {
    await updateTask(id, { status, completed: status === 'done' });
  }, [updateTask]);

  const deleteTask = useCallback(async (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    addActivity('delete', activeUserId, id, 'deleted task');

    if (isSupabaseConfigured) {
      try {
        await supabase.from('tasks').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase task delete failed:', e);
      }
    }
  }, [activeUserId, addActivity]);

  const toggleTask = useCallback(async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const completed = !task.completed;
    const newStatus = completed ? 'done' : 'todo';

    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed, status: newStatus } : t));
    addActivity(!task.completed ? 'complete' : 'update', activeUserId, id, !task.completed ? 'completed task' : 'reopened task');

    if (isSupabaseConfigured) {
      try {
        await supabase.from('tasks').update({ completed, status: newStatus }).eq('id', id);
      } catch (e) {
        console.error('Supabase toggle task failed:', e);
      }
    }
  }, [tasks, activeUserId, addActivity]);

  const clearActivities = useCallback(async () => {
    setActivities([]);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('activities').delete().gte('id', 0);
      } catch (e) {
        console.error('Supabase clear activities failed:', e);
      }
    }
  }, []);

  const addUser = useCallback((data: Omit<User, 'id' | 'avatarClass' | 'status'>) => {
    showToast('⚠️ Maximum 3 team accounts allowed in this system', 'warning');
  }, [showToast]);

  const removeUser = useCallback((id: number) => {
    showToast('⚠️ Core 3 team member accounts cannot be removed', 'warning');
  }, [showToast]);

  return (
    <AppContext.Provider value={{
      tasks, users, activities, toasts, currentView, sidebarCollapsed,
      activeUserId, activeUser, isLoading,
      isAuthenticated, login, logout,
      setCurrentView, setSidebarCollapsed, switchUser,
      addTask, updateTask, updateTaskStatus, deleteTask, toggleTask,
      addUser, removeUser,
      addActivity, clearActivities,
      showToast, removeToast,
      getUser, getTask,
      nextTaskId, nextUserId, nextActivityId,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
