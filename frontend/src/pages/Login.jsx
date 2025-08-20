import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined, EyeInvisibleOutlined, UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import api from '@api/api';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('아이디와 비밀번호를 입력하세요.');
      return;
    }
    try {
      setSubmitting(true);
      const response = await api.post('/login', { username, password });
      const data = response?.data || {};
      const headers = response?.headers || {};
      const bearer = headers?.authorization || headers?.Authorization;
      const tokenFromHeader = bearer && bearer.startsWith('Bearer ') ? bearer.slice('Bearer '.length) : undefined;
      const token = data.accessToken || data.token || tokenFromHeader;
      if (token) localStorage.setItem('accessToken', token);
      setErrorMessage('');
      navigate('/home', { replace: true });
    } catch (err) {
      setErrorMessage('로그인에 실패했습니다. 아이디/비밀번호를 확인해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='login-page'>
      <div className='container'>
        <div className='auth-card'>
          <h1>로그인</h1>

          <form onSubmit={handleSubmit} noValidate>
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
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                autoComplete='username'
              />
              <label className='floating-label' htmlFor='username'>
                아이디
              </label>
            </div>

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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  onKeyUp={(e) => {
                    // @ts-ignore - getModifierState exists at runtime
                    const isCaps = e.getModifierState && e.getModifierState('CapsLock');
                    setCapsLockOn(!!isCaps);
                  }}
                  autoComplete='current-password'
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
                  onKeyDown={(e) => {
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

            {capsLockOn ? <div className='hint-text'>Caps Lock이 켜져 있습니다.</div> : null}

            {errorMessage ? <div className='error-text'>{errorMessage}</div> : null}

            <button className='signin__btn' type='submit' disabled={submitting}>
              {submitting ? (
                <>
                  <span className='spinner' aria-hidden /> 로그인...
                </>
              ) : (
                '로그인'
              )}
            </button>

            <button className='signup__btn' type='button'>
              회원가입
            </button>

            <div className='helper-row'>
              <a className='helper-link' href='#'>
                비밀번호를 잊으셨나요?
              </a>
            </div>
          </form>

          <div className='separator'>
            <p>OR</p>
          </div>

          <button className='google__btn' type='button'>
            <GoogleOutlined style={{ fontSize: 20 }} />
            Google로 로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
