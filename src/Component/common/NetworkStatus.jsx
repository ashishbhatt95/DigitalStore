import { useEffect, useState } from "react";

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-15px); }
        100% { transform: translateY(0px); }
      }
    `;
    document.head.appendChild(style);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      document.head.removeChild(style);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      if (navigator.onLine) {
        setIsOnline(true);
      }
    }, 1500);
  };

  if (!isOnline) {
    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 bg-white" style={{ zIndex: 99999 }}>
        <div className="container h-100">
          <div className="row h-100 justify-content-center align-items-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="card border-0 shadow-lg">
                <div className="card-body text-center p-5" style={{ background: "linear-gradient(to bottom, #ffebee, #fce4ec)" }}>
                  
                  {/* Illustration */}
                  <div className="position-relative mb-4">
                    <div className="display-1 mb-3 d-inline-block">
                      <OfflineIllustration />
                    </div>
                  </div>

                  <h1 className="display-5 fw-bold text-danger mb-2">Oops! You're Offline!</h1>
                  <p className="lead text-secondary mb-4">Check your connection and come back for more great deals!</p>

                  <button 
                    className="btn btn-danger btn-lg px-5 py-3 rounded-pill mb-4"
                    onClick={handleRetry}
                    disabled={isRetrying}
                  >
                    {isRetrying ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Reconnecting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-repeat me-2"></i>
                        Try Again
                      </>
                    )}
                  </button>

                  <div className="mt-3 text-secondary">
                    <p className="mb-2">If the problem persists, please try:</p>
                    <div className="d-flex justify-content-center">
                      <ul className="list-unstyled text-start">
                        <li className="mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          Checking your WiFi connection
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          Restarting your router
                        </li>
                        <li>
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          Contacting your service provider
                        </li>
                      </ul>
                    </div>
                  </div>

                  <FloatingIcons />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const OfflineIllustration = () => (
  <div className="position-relative d-inline-block">
    <div className="position-relative">
      <span className="position-relative" style={{ fontSize: "3rem" }}>👩</span>
      <span className="position-absolute bottom-0 start-50 translate-middle-x" style={{ fontSize: "2rem" }}>🛍️</span>
    </div>
    <div className="position-absolute top-0 end-0 translate-middle-x">
      <span className="position-relative" style={{ fontSize: "1.5rem" }}>📶</span>
      <div className="position-absolute top-50 start-0 w-100" 
           style={{ height: "3px", background: "red", transform: "rotate(-45deg)" }}>
      </div>
    </div>
  </div>
);

const FloatingIcons = () => {
  const icons = ["🛒", "☁️", "📱", "💻", "🔌", "🛍️"];
  return (
    <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden">
      {icons.map((icon, index) => (
        <div 
          key={index}
          className="position-absolute"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${10 + Math.random() * 80}%`,
            fontSize: "1.5rem",
            opacity: 0.3,
            animation: `float ${3 + Math.random() * 4}s infinite ease-in-out`,
            animationDelay: `${Math.random() * 2}s`
          }}
        >
          {icon}
        </div>
      ))}
    </div>
  );
};

export default NetworkStatus;
