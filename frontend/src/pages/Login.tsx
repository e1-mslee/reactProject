import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  MailOutlined,
} from '@ant-design/icons';
import api from '@api/api';
import './Login.css';
import type { FormEvent, KeyboardEvent, ChangeEvent } from 'react';

const Login = () => {
  const navigate = useNavigate();

  // 로그인/회원가입 모드 전환
  const [isSignUp, setIsSignUp] = useState(false);

  // 공통 상태
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  // 회원가입 전용 상태
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');

  // 폼 초기화
  const resetForm = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    setConfirmPassword('');
    setName('');
    setErrorMessage('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // 모드 전환
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  // 로그인 처리
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('아이디와 비밀번호를 입력하세요.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post<{ accessToken?: string }>(
        '/login',
        { username, password },
        { withCredentials: true }
      );
      const data = response?.data || {};
      const headers = response?.headers as Record<string, string>;
      const bearer = headers?.authorization || headers?.Authorization;
      const tokenFromHeader =
        bearer && typeof bearer === 'string' && bearer.startsWith('Bearer ')
          ? bearer.slice('Bearer '.length)
          : undefined;
      const accesstoken = data.accessToken;
      if (accesstoken) {
        localStorage.setItem('accessToken', accesstoken);
        setErrorMessage('');
        void navigate('/home', { replace: true });
      } else {
        setErrorMessage('로그인에 실패했습니다. 토큰을 받을 수 없습니다.');
      }
    } catch (err) {
      setErrorMessage('로그인에 실패했습니다. 아이디/비밀번호를 확인해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  // 회원가입 처리
  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 유효성 검사
    if (!username || !password || !email || !confirmPassword) {
      setErrorMessage('모든 필드를 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/signup', {
        username,
        password,
        email,
        name: name || username,
      });

      if (response.status === 200 || response.status === 201) {
        setErrorMessage('');
        // 회원가입 성공 시 로그인 모드로 전환
        setIsSignUp(false);
        resetForm();
        setErrorMessage('회원가입이 완료되었습니다. 로그인해주세요.');
      }
    } catch (err) {
      let errorMsg = '회원가입에 실패했습니다.';
      if (err && typeof err === 'object' && 'response' in err) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        errorMsg = errorObj.response?.data?.message || errorMsg;
      }
      setErrorMessage(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='login-page'>
      <div className='container'>
        <div className='auth-card'>
          <h1>{isSignUp ? '회원가입' : '로그인'}</h1>

          <form onSubmit={(e) => void (isSignUp ? handleSignUp(e) : handleLogin(e))} noValidate>
            {/* 아이디 필드 */}
            <div className='first-input input__block first-input__block floating-group input-with-icon'>
              <span className='input-icon'>
                <UserOutlined />
              </span>
              <input
                type='text'
                name='username'
                placeholder=' '
                className={`input floating-input${errorMessage ? ' error' : ''}`}
                id='username'
                value={username}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                autoComplete='username'
              />
              <label className='floating-label' htmlFor='username'>
                아이디
              </label>
            </div>

            {/* 회원가입 시 이메일 필드 */}
            {isSignUp && (
              <div className='input__block floating-group input-with-icon'>
                <span className='input-icon'>
                  <MailOutlined />
                </span>
                <input
                  type='email'
                  name='email'
                  placeholder=' '
                  className={`input floating-input${errorMessage ? ' error' : ''}`}
                  id='email'
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoComplete='email'
                />
                <label className='floating-label' htmlFor='email'>
                  이메일
                </label>
              </div>
            )}

            {isSignUp && (
              <div className='input__block floating-group input-with-icon'>
                <span className='input-icon'>
                  <UserOutlined />
                </span>
                <input
                  type='text'
                  name='name'
                  placeholder=' '
                  className='input floating-input'
                  id='name'
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  autoComplete='name'
                />
                <label className='floating-label' htmlFor='name'>
                  이름
                </label>
              </div>
            )}

            {/* 비밀번호 필드 */}
            <div className='input__block input-with-icon'>
              <div className='input-with-action floating-group'>
                <span className='input-icon'>
                  <LockOutlined />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  placeholder=' '
                  className={`input floating-input${errorMessage ? ' error' : ''}`}
                  id='password'
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  onKeyUp={(e: KeyboardEvent<HTMLInputElement>) => {
                    const isCaps = e.getModifierState && e.getModifierState('CapsLock');
                    setCapsLockOn(!!isCaps);
                  }}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                <label className='floating-label' htmlFor='password'>
                  비밀번호
                </label>
                <span
                  className='toggle-password'
                  role='button'
                  tabIndex={0}
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  onClick={() => setShowPassword((v) => !v)}
                  onKeyDown={(e: KeyboardEvent<HTMLSpanElement>) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowPassword((v) => !v);
                    }
                  }}
                >
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </span>
              </div>
            </div>

            {/* 회원가입 시 비밀번호 확인 필드 */}
            {isSignUp && (
              <div className='input__block input-with-icon'>
                <div className='input-with-action floating-group'>
                  <span className='input-icon'>
                    <LockOutlined />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name='confirmPassword'
                    placeholder=' '
                    className={`input floating-input${errorMessage ? ' error' : ''}`}
                    id='confirmPassword'
                    value={confirmPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setConfirmPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    autoComplete='new-password'
                  />
                  <label className='floating-label' htmlFor='confirmPassword'>
                    비밀번호 확인
                  </label>
                  <span
                    className='toggle-password'
                    role='button'
                    tabIndex={0}
                    aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    onKeyDown={(e: KeyboardEvent<HTMLSpanElement>) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setShowConfirmPassword((v) => !v);
                      }
                    }}
                  >
                    {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </span>
                </div>
              </div>
            )}

            {capsLockOn ? <div className='hint-text'>Caps Lock이 켜져 있습니다.</div> : null}

            {errorMessage ? (
              <div
                className={`error-text ${
                  !isSignUp && errorMessage === '회원가입이 완료되었습니다. 로그인해주세요.' ? 'success-text' : ''
                }`}
              >
                {errorMessage}
              </div>
            ) : null}

            {/* 메인 액션 버튼 */}
            <button className='signin__btn' type='submit' disabled={submitting}>
              {submitting ? (
                <>
                  <span className='spinner' aria-hidden /> {isSignUp ? '가입 중...' : '로그인...'}
                </>
              ) : isSignUp ? (
                '회원가입'
              ) : (
                '로그인'
              )}
            </button>

            {/* 모드 전환 버튼 */}
            <button className='signup__btn' type='button' onClick={toggleMode}>
              {isSignUp ? '로그인으로 돌아가기' : '회원가입'}
            </button>

            {/* 로그인 모드에서만 비밀번호 찾기 링크 표시 */}
            {!isSignUp && (
              <div className='helper-row'>
                <a className='helper-link' href='#'>
                  비밀번호를 잊으셨나요?
                </a>
              </div>
            )}
          </form>

          {/* 로그인 모드에서만 소셜 로그인 표시 */}
          {!isSignUp && (
            <>
              <div className='separator'>
                <p>OR</p>
              </div>

              <button className='google__btn' type='button'>
                <GoogleOutlined style={{ fontSize: 20 }} />
                Google로 로그인
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
