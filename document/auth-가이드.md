## 사용예제
```
// 인증 및 권한 관리 사용 예제

// 필요한 모듈 가져오기
import { 
  authManager,
  hasRequiredRole,
  getRoles, 
  ROLE_HIERARCHY,
  ROLE_DISPLAY_NAMES,
  formatSessionTime,
  calculateSessionState,
  SessionState,
  getSessionStateColorClass,
  createSessionStateMessage,
  filterMenuByPermission,
  MenuItem,
  MenuTree
} from '@ds/core/auth';

// 1. 로그인 처리
async function handleLogin(email: string, password: string) {
  try {
    const response = await authManager.login({ email, password });
    console.log('로그인 성공:', response.user);
    // 로그인 성공 후 처리...
  } catch (error) {
    console.error('로그인 실패:', error);
    // 오류 처리...
  }
}

// 2. 세션 정보 표시 컴포넌트 예제
function SessionInfoComponent() {
  const currentUser = authManager.getCurrentUser();
  const remainingTime = authManager.getSessionTimeRemaining();
  
  // 세션 상태 계산
  const sessionState = calculateSessionState(remainingTime);
  
  // 세션 상태에 따른 색상 클래스 가져오기
  const colorClass = getSessionStateColorClass(sessionState);
  
  // 남은 시간 형식화
  const formattedTime = formatSessionTime(remainingTime);
  
  // 세션 상태 메시지 생성
  const message = createSessionStateMessage(sessionState, formattedTime);
  
  // 세션 갱신 핸들러
  const handleRefreshSession = async () => {
    const refreshToken = localStorage.getItem('ds_refresh_token');
    if (refreshToken) {
      try {
        await authManager.refreshToken(refreshToken);
        console.log('세션이 성공적으로 갱신되었습니다.');
      } catch (error) {
        console.error('세션 갱신 실패:', error);
      }
    }
  };
  
  return `
    <div class="session-info ${colorClass}">
      ${message}
      ${sessionState === SessionState.WARNING || sessionState === SessionState.EXPIRING 
        ? `<button onclick="handleRefreshSession()">세션 연장</button>` 
        : ''}
    </div>
  `;
}

// 3. 권한 기반 UI 조건부 렌더링 예제
function AdminPanelButton() {
  const currentUser = authManager.getCurrentUser();
  
  // 관리자 권한 확인
  if (currentUser && hasRequiredRole(currentUser.role, 'admin')) {
    return `<button>관리자 패널</button>`;
  }
  return null;
}

function SuperAdminSettingsButton() {
  const currentUser = authManager.getCurrentUser();
  
  // 슈퍼관리자 권한 확인
  if (currentUser && hasRequiredRole(currentUser.role, 'super_admin')) {
    return `<button>시스템 설정</button>`;
  }
  return null;
}

// 4. 권한 기반 메뉴 필터링 예제
const fullMenuTree: MenuTree = {
  items: [
    {
      id: 'home',
      label: '홈',
      path: '/',
      icon: 'home'
    },
    {
      id: 'dashboard',
      label: '대시보드',
      path: '/dashboard',
      icon: 'dashboard',
      requiredRole: 'user'
    },
    {
      id: 'admin',
      label: '관리',
      icon: 'settings',
      requiredRole: 'admin',
      children: [
        {
          id: 'users',
          label: '사용자 관리',
          path: '/admin/users',
          requiredRole: 'admin'
        },
        {
          id: 'reports',
          label: '보고서',
          path: '/admin/reports',
          requiredRole: 'admin'
        }
      ]
    },
    {
      id: 'system',
      label: '시스템 설정',
      path: '/system',
      icon: 'system',
      requiredRole: 'super_admin'
    },
    {
      id: 'vendor',
      label: '업체 관리',
      path: '/vendor',
      icon: 'store',
      requiredRole: 'vendor'
    }
  ]
};

// 현재 사용자 정보 가져오기
const currentUser = authManager.getCurrentUser();

// 현재 사용자 권한에 맞는 메뉴만 필터링
const filteredMenu = filterMenuByPermission(fullMenuTree, currentUser?.role);

// 필터링된 메뉴 렌더링 (실제 구현에서는 React 등 프론트엔드 프레임워크 사용)
function renderMenu(menuItems: MenuItem[]) {
  return menuItems.map(item => {
    if (item.children && item.children.length > 0) {
      return `
        <li>
          ${item.label}
          <ul>
            ${renderMenu(item.children)}
          </ul>
        </li>
      `;
    }
    return `<li><a href="${item.path}">${item.label}</a></li>`;
  }).join('');
}

// 5. 권한 검사 및 권한 거부 처리 예제
function checkAdminAccess() {
  const currentUser = authManager.getCurrentUser();
  
  if (!currentUser || !hasRequiredRole(currentUser.role, 'admin')) {
    // 권한 거부 처리
    return {
      success: false,
      message: `해당 기능에 접근할 권한이 없습니다. 필요 권한: 관리자`,
      redirect: '/access-denied'
    };
  }
  
  return { success: true };
}

// 6. 역할 목록 및 표시 이름 사용 예제
function RoleSelector() {
  const roles = getRoles();
  
  return `
    <select>
      ${roles.map(role => `
        <option value="${role}">${ROLE_DISPLAY_NAMES[role]}</option>
      `).join('')}
    </select>
  `;
}
```

## 인증 서비스 통합예제
```angular2html
// React 컴포넌트 예제: authManager를 React 애플리케이션에 통합하는 방법

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  authManager, 
  AuthState, 
  calculateSessionState,
  SessionState,
  formatSessionTime,
  getSessionStateColorClass,
  createSessionStateMessage,
  UserRole
} from '@ds/core/auth';

// 인증 컨텍스트 인터페이스
interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  sessionTimeRemaining: number;
  formattedSessionTime: string;
  sessionState: SessionState;
  sessionStateMessage: string;
  sessionStateColorClass: string;
}

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 인증 제공자 컴포넌트
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    isLoading: false,
    error: null,
    sessionTimeRemaining: 0
  });

  // 세션 관련 상태
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(0);

  // 인증 상태 구독
  useEffect(() => {
    const unsubscribe = authManager.subscribe((state) => {
      setAuthState(state);
    });

    return () => unsubscribe();
  }, []);

  // 세션 시간 구독
  useEffect(() => {
    const unsubscribe = authManager.subscribeToSessionUpdates((remainingTime) => {
      setSessionTimeRemaining(remainingTime);
    });

    return () => unsubscribe();
  }, []);

  // 세션 상태 계산
  const sessionState = calculateSessionState(sessionTimeRemaining);
  const formattedSessionTime = formatSessionTime(sessionTimeRemaining);
  const sessionStateColorClass = getSessionStateColorClass(sessionState);
  const sessionStateMessage = createSessionStateMessage(sessionState, formattedSessionTime);

  // 로그인 처리
  const login = async (email: string, password: string): Promise<void> => {
    try {
      await authManager.login({ email, password });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // 로그아웃 처리
  const logout = async (): Promise<void> => {
    try {
      await authManager.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  // 세션 갱신
  const refreshSession = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('ds_refresh_token');
      if (refreshToken) {
        await authManager.refreshToken(refreshToken);
      } else {
        throw new Error('No refresh token available');
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      throw error;
    }
  };

  // 역할 확인
  const hasRole = (role: UserRole): boolean => {
    return authManager.hasRole(role);
  };

  // 인증 여부 확인
  const isAuthenticated = authManager.isAuthenticated();

  const contextValue: AuthContextType = {
    authState,
    login,
    logout,
    refreshSession,
    isAuthenticated,
    hasRole,
    sessionTimeRemaining,
    formattedSessionTime,
    sessionState,
    sessionStateMessage,
    sessionStateColorClass
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 인증 컨텍스트 사용을 위한 훅
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 인증 필요 라우트 래퍼 컴포넌트
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      // 인증되지 않은 경우 로그인 페이지로 리디렉션
      navigate('/login', { 
        replace: true, 
        state: { from: location.pathname } 
      });
    } else if (requiredRole && !hasRole(requiredRole)) {
      // 권한이 없는 경우 접근 거부 페이지로 리디렉션
      navigate('/access-denied', { replace: true });
    }
  }, [isAuthenticated, hasRole, requiredRole, navigate, location]);

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  return <>{children}</>;
};

// 세션 타이머 컴포넌트
export const SessionTimer: React.FC = () => {
  const { 
    sessionTimeRemaining, 
    formattedSessionTime, 
    sessionState, 
    sessionStateMessage, 
    sessionStateColorClass,
    refreshSession
  } = useAuth();

  // 세션 갱신 버튼 표시 여부
  const showRefreshButton = 
    sessionState === SessionState.WARNING || 
    sessionState === SessionState.EXPIRING;

  return (
    <div className={`session-timer ${sessionStateColorClass}`}>
      <span>{sessionStateMessage}</span>
      {showRefreshButton && (
        <button 
          onClick={() => refreshSession()}
          className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
        >
          세션 연장
        </button>
      )}
    </div>
  );
};

// 코드에 필요한 import
function useNavigate() {
  return (path: string, options?: any) => {
    console.log(`Navigating to ${path}`, options);
  };
}
```