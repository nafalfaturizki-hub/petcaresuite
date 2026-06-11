import { Bell, Menu, Moon, Sun, LogOut, Search, UserCircle, ChevronRight, Inbox } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/ui.store';
import { useAuthActions } from '@/features/auth/auth.hooks';
import { supabase } from '@/lib/supabase';

interface NotificationItem {
  id: string;
  channel: string;
  recipient: string;
  template_key?: string | null;
  payload: any;
  status: string;
  error_message?: string | null;
  sent_at?: string | null;
  created_at: string;
  isRead?: boolean;
}

interface NavbarProps {
  onOpenCommand: () => void;
  onToggleSidebar: () => void;
}

export function Navbar({ onOpenCommand, onToggleSidebar }: NavbarProps) {
  const user = useAuthStore((state) => state.user);
  const { signOut } = useAuthActions();
  const setTheme = useUIStore((state) => state.setTheme);
  const activeTheme = useUIStore((state) => state.activeTheme);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const navigate = useNavigate();

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.isRead).length, [notifications]);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setIsLoadingNotifications(false);
      return;
    }

    let isMounted = true;

    async function loadNotifications() {
      setIsLoadingNotifications(true);
      const { data, error } = await supabase
        .from('notifications_log')
        .select('id, channel, recipient, template_key, payload, status, error_message, sent_at, created_at')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(5);

      if (isMounted) {
        setNotifications((data || []).map((item) => ({ ...item, isRead: false })));
        setIsLoadingNotifications(false);
      }
    }

    loadNotifications();

    const channel = supabase
      .channel(`notifications-log-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications_log', filter: `user_id=eq.${user.id}` },
        ({ new: newRecord }) => {
          if (!newRecord || !isMounted) {
            return;
          }

          setNotifications((current) => [{ ...newRecord, isRead: false }, ...current].slice(0, 5));
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const markAsRead = (id: string) => {
    setNotifications((current) => current.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)));
  };

  const markAllAsRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
  };

  return (
    <div className="relative flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onToggleSidebar}>
          <Menu className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onOpenCommand}>
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setTheme(activeTheme === 'light' ? 'dark' : 'light')}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {activeTheme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((open) => !open)}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && <span className="absolute right-1 top-1 inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />}
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 top-14 z-20 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-sm font-semibold dark:border-slate-800">
                <span>Notifications</span>
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto p-3">
                {isLoadingNotifications ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="animate-pulse rounded-2xl bg-slate-100 p-3 dark:bg-slate-800" />
                    ))}
                  </div>
                ) : notifications.length ? (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`rounded-3xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-950 ${notification.isRead ? 'opacity-70' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                              <Inbox className="h-4 w-4" />
                              <span className="font-semibold">{notification.template_key ?? notification.channel}</span>
                            </div>
                            <p className="mt-1 text-slate-600 dark:text-slate-400">
                              {notification.payload?.message ?? notification.recipient}
                            </p>
                            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                              {notification.sent_at ?? notification.created_at}
                            </div>
                          </div>
                          {!notification.isRead && (
                            <button
                              type="button"
                              className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-sm text-slate-500 dark:text-slate-400">No notifications</div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((current) => !current)}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-900 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            <UserCircle className="h-5 w-5" />
            <span>{user?.fullName ?? 'User'}</span>
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/profile');
                }}
                className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <UserCircle className="h-4 w-4" />
                Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  signOut();
                }}
                className="mt-2 flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      {(isProfileOpen || isNotificationsOpen) && <div className="fixed inset-0 z-10 lg:hidden" onClick={() => { setIsProfileOpen(false); setIsNotificationsOpen(false); }} />}
    </div>
  );
}
