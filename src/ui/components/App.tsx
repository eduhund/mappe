import React, { useEffect, useRef, useState } from 'react';
import '../styles/ui.css';
import { Button, Input, Tooltip, Typography, Space, Switch } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text, Link } = Typography;
import { nodesData } from '../../types';

function Map({ navTo }) {
  const mapRef = useRef(null);

  const [frames, setFrames] = useState<nodesData | null>(null);

  const [view, setView] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [relative, setRelative] = useState(true);

  const [status, setStatus] = useState('trial');

  function relativeScaleSwitchHandler() {
    setRelative(!relative);
    parent.postMessage({ pluginMessage: { type: 'CHANGE_RELATIVE_SCALE', data: { value: !relative } } }, '*');
  }

  useEffect(() => {
    const canvas = mapRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = 262 * 2;
    canvas.height = 262 * 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (frames) {
      const color = '#17141e';
      Object.values(frames).forEach(({ type, x, y, width, height }) => {
        if (type === 'SECTION') {
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + width, y);
          ctx.lineTo(x + width, y + height);
          ctx.lineTo(x, y + height);
          ctx.lineTo(x, y);
          ctx.closePath();

          ctx.lineWidth = 1;
          ctx.strokeStyle = color;
          ctx.stroke();

          ctx.globalAlpha = 0.2;

          ctx.fillStyle = color;
          ctx.fill();
        } else {
          ctx.globalAlpha = 1;

          ctx.fillStyle = color;
          ctx.fillRect(x, y, width, height);
        }
      });
    }
  }, [frames]);

  useEffect(() => {
    const handleMessage = (event) => {
      const { type, data } = event.data.pluginMessage;

      if (type === 'updateMap') {
        setFrames(Object.assign({}, frames, data));
      }

      if (type === 'updateSelectionView') {
        setView({ ...view, ...data });
      }

      if (type === 'SET_STATUS') {
        setStatus(data.status);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    parent.postMessage({ pluginMessage: { type: 'INIT_RENDER' } }, '*');
  }, []);

  return (
    <>
      <div id="mapContainer" className={status === 'trialEnded' ? ' _blurred' : ''}>
        <div id="currentView" style={view}></div>
        <canvas id="map" ref={mapRef} width="262" height="262"></canvas>
      </div>
      {status !== 'trialEnded' && (
        <label className="mapLabel" id="relativeScaleLabel" htmlFor="relativeScale">
          <Switch id="relativeScale" size="small" checked={relative} onChange={relativeScaleSwitchHandler} />
          Relative scale
        </label>
      )}
      {status !== 'full' && (
        <div className={'mapLabel' + (status === 'trialEnded' ? ' trialEnded' : '')} id="buy">
          <Button
            size={status === 'trialEnded' ? 'middle' : 'small'}
            type={status === 'trialEnded' ? 'primary' : 'link'}
            onClick={() => navTo('buy')}
          >
            Get full version
          </Button>
        </div>
      )}
    </>
  );
}

function Buy({ navTo }) {
  const [emailValue, setEmailValue] = useState(null);
  const [isEmailValid, setIsEmailValid] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  function checkSubscription(e) {
    e.preventDefault();
    setIsEmailValid(null);
    setIsChecking(true);
    parent.postMessage(
      {
        pluginMessage: {
          type: 'CHECK_EMAIL',
          email: emailValue,
        },
      },
      '*'
    );
  }

  function emailValueHandler(value) {
    setIsEmailValid(null);
    setEmailValue(value);
  }

  return (
    <div className="content">
      <Button type="link" onClick={() => navTo('map')}>
        Back
      </Button>
      <div className="block features">
        <Title level={3}>What will you get?</Title>
        <ul>
          <li>
            <Text>Full access to the plugin features</Text>
          </li>
          <li>
            <Text>All future updates</Text>
          </li>
        </ul>
      </div>
      <div className="block instruction">
        <Title level={3}>Steps to buy</Title>
        <ol>
          <li>
            <Text>
              Go to the <Link href="https://eduhund.gumroad.com/l/mappe">MAPPE page</Link> on Gumroad and join the
              monthly subscription. In the order provide a valid email and your name to continue
            </Text>
          </li>
          <li>
            <Text>
              Wait 1-2 minutes (while we receive your subscription details) and enter the email you provided on Gumroad
            </Text>
          </li>
          <div>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                type="email"
                value={emailValue}
                placeholder="your@email.here"
                status={isEmailValid === false ? 'error' : null}
                disabled={isChecking}
                suffix={
                  isEmailValid === false ? (
                    <Tooltip title="We didn't find your email. Please, check it or contact us.">
                      <ExclamationCircleOutlined style={{ color: 'red' }} />
                    </Tooltip>
                  ) : null
                }
                onChange={({ target }) => emailValueHandler(target.value)}
                onPressEnter={checkSubscription}
              />
              <Button
                type="primary"
                danger={isEmailValid === false}
                loading={isChecking}
                disabled={isEmailValid === false}
                onClick={checkSubscription}
              >
                {isEmailValid === false ? 'Invalid email' : 'Check'}
              </Button>
            </Space.Compact>
          </div>
        </ol>
        <Text>When succeed, this modal will close and you can start using the plugin.</Text>
        <Text>
          Please <a href="mailto:we@eduhund.com">contact us</a> if you experience any problems.
        </Text>
      </div>
      <footer className="main_footer">
        <Text>
          <Link href="https://nebel.im" underline>
            Roman Nebel
          </Link>{' '}
          from{' '}
          <Link href="https://eduhund.com" underline>
            eduHund
          </Link>
        </Text>
        <nav className="footer_nav">
          <Text>
            <Link underline href="mailto:we@eduhund.com">
              Mail us
            </Link>
          </Text>
        </nav>
      </footer>
    </div>
  );
}

function App() {
  const [page, setPage] = useState('map');

  useEffect(() => {
    const handleMessage = (event) => {
      const { type, data } = event.data.pluginMessage;

      if (type === 'SET_PAGE') {
        const { page } = data;
        setPage(page);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <>
      {page === 'map' && <Map navTo={setPage} />}
      {page === 'buy' && <Buy navTo={setPage} />}
    </>
  );
}

export default App;
