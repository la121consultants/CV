
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MainAppView } from './components/MainAppView';
import { AdminAuth } from './components/AdminAuth';
import { AdminPanel } from './components/AdminPanel';
import { UserLogin } from './components/UserLogin';
import type { LoggedInUser } from './types';
import { Spinner } from './components/Spinner';
import { UsageLimitModal } from './components/UsageLimitModal';
import { IncognitoBlocker } from './components/IncognitoBlocker';

const USER_SESSION_KEY = 'la121UserSession';

const App: React.FC = () => {
    const [view, setView] = useState<'main' | 'user-login' | 'admin-login' | 'admin'>('main');
    const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUsageModalOpen, setUsageModalOpen] = useState(false);
    const [isUpgradeFlow, setIsUpgradeFlow] = useState(false);
    const [isPrivateMode, setIsPrivateMode] = useState<boolean | null>(null); // null means check is pending

    useEffect(() => {
        try {
            const userSessionRaw = localStorage.getItem(USER_SESSION_KEY);
            if (userSessionRaw) {
                const userSession: LoggedInUser = JSON.parse(userSessionRaw);
                setLoggedInUser(userSession);
            }
        } catch (e) {
            console.error("Failed to parse user session", e);
            localStorage.removeItem(USER_SESSION_KEY);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const checkPrivacy = async () => {
             // A multi-pronged approach to reliably detect private mode without false positives.
            new Promise<boolean>(resolve => {
                // Check 1: FileSystem API (for Chrome, Edge, Safari)
                // This is a widely used and reliable method. The API fails in incognito mode.
                const fs = (window as any).webkitRequestFileSystem;
                if (!fs) {
                    // If the API doesn't exist, we can't be sure, so we move to the next check.
                    resolve(false);
                    return;
                }
                fs(
                    (window as any).TEMPORARY,
                    1,
                    () => resolve(false), // Success: Not in private mode.
                    () => resolve(true)   // Failure: In private mode.
                );
            }).then(isFileSystemPrivate => {
                if (isFileSystemPrivate) {
                    setIsPrivateMode(true);
                    return;
                }
                
                // Check 2: localStorage (for Firefox)
                // Firefox throws an error when trying to use localStorage in private mode.
                try {
                    localStorage.setItem('__privacy_test__', '1');
                    localStorage.removeItem('__privacy_test__');
                    // If both checks pass, we are confident it's a normal session.
                    setIsPrivateMode(false);
                } catch (e) {
                    // This catch block is the signal for Firefox private mode.
                    setIsPrivateMode(true);
                }
            });
        };

        checkPrivacy();
    }, []);


    const handleOpenUsageModal = (isUpgrade: boolean) => {
        setIsUpgradeFlow(isUpgrade);
        setUsageModalOpen(true);
    };

    const handleLoginSuccess = (user: LoggedInUser) => {
        setLoggedInUser(user);
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
        // If superadmin logs in, take them to the admin panel, otherwise to main.
        if (user.role === 'superadmin') {
            setView('admin');
        } else {
            setView('main'); 
        }
    };

    const handleLogout = () => {
        setLoggedInUser(null);
        localStorage.removeItem(USER_SESSION_KEY);
        setView('main');
    };
    
    const navigateTo = (newView: 'main' | 'user-login' | 'admin-login' | 'admin') => {
        // Auth guard for the admin view
        if (newView === 'admin' && loggedInUser?.role !== 'superadmin') {
            setView('admin-login'); // Redirect to login if not an authenticated admin
            return;
        }
        setView(newView);
    }

    const renderView = () => {
        switch (view) {
            case 'user-login':
                return <UserLogin onLoginSuccess={handleLoginSuccess} />;
            case 'admin-login':
                return <AdminAuth onLoginSuccess={handleLoginSuccess} />;
            case 'admin':
                // The guard in navigateTo ensures loggedInUser is a superadmin
                return loggedInUser ? <AdminPanel loggedInUser={loggedInUser} /> : null;
            case 'main':
            default:
                // Block the main app for anonymous users in private mode.
                if (isPrivateMode && !loggedInUser) {
                    return <IncognitoBlocker onUpgradeClick={() => handleOpenUsageModal(true)} />;
                }
                return <MainAppView 
                    loggedInUser={loggedInUser} 
                    setLoggedInUser={setLoggedInUser}
                    onUsageLimit={handleOpenUsageModal}
                />;
        }
    };

    // Combined loading state for session and privacy check
    if (isLoading || isPrivateMode === null) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-light">
                <div className="flex flex-col items-center">
                    <svg
                      className="animate-spin h-8 w-8 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <p className="mt-4 text-gray-600 text-lg">Initializing...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
            <Header 
                loggedInUser={loggedInUser}
                onLogout={handleLogout}
                onNavigateToHome={() => navigateTo('main')}
                onNavigateToUserLogin={() => navigateTo('user-login')}
                onNavigateToAdmin={() => navigateTo('admin')}
                onUpgradeClick={() => handleOpenUsageModal(true)}
            />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex items-center justify-center">
                {renderView()}
            </main>
            <Footer 
                loggedInUser={loggedInUser}
                onNavigateToAdminLogin={() => navigateTo('admin-login')}
            />
            {isUsageModalOpen && (
                <UsageLimitModal 
                    onClose={() => setUsageModalOpen(false)} 
                    isUpgradeFlow={isUpgradeFlow}
                />
            )}
        </div>
    );
};

export default App;
