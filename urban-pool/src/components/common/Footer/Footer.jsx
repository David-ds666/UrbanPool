import "./Footer.css"

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <h2 className="footer-brand">UrbanPool</h2>
        <p className="footer-help">Visit Help Center</p>
      </div>

      <div className="footer-links">
        <div className="footer-column">
          <h4>Company</h4>
          <ul>
            <li>About us</li>
            <li>Our offerings</li>
            <li>Newsroom</li>
            <li>Investors</li>
            <li>Blog</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Products</h4>
          <ul>
            <li>Ride</li>
            <li>Offer Ride</li>
            <li>UrbanPool for Business</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Safety</h4>
          <ul>
            <li>User verification</li>
            <li>Ratings & Reviews</li>
            <li>Secure payments</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Travel</h4>
          <ul>
            <li>Cities</li>
            <li>Airports</li>
            <li>Reserve</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          <a 
            href="https://github.com/David-ds666" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            © 2026 UrbanPool | Developed by Davinder Singh
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer