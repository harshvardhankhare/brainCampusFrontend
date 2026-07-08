import { Link } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">🔍</div>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-message">
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="not-found-btn">
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;