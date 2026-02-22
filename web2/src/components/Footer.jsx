import React, { useEffect } from "react";
import "../css/Footer.css"; // We'll create this CSS file separately

const Footer = () => {
  // Initialize current year
  useEffect(() => {
    document.getElementById("currentYear").textContent =
      new Date().getFullYear();
  }, []);

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* Social Media Section */}
      <section className="social-section">
        <h2 className="social-title">🔗 Connect with CIB</h2>

        <div className="social-container">
          <a
            href="https://www.facebook.com/cibdhaka"
            target="_blank"
            rel="noopener noreferrer"
            className="social-glass-pill fb"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg"
              alt="Facebook"
            />
            <span>Facebook</span>
          </a>

          <a
            href="https://instagram.com/cib.dhk"
            target="_blank"
            rel="noopener noreferrer"
            className="social-glass-pill ig"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg"
              alt="Instagram"
            />
            <span>Instagram</span>
          </a>

          <a
            href="https://wa.me/8801338958997"
            target="_blank"
            rel="noopener noreferrer"
            className="social-glass-pill wa"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/whatsapp.svg"
              alt="WhatsApp"
            />
            <span>Whatsapp</span>
          </a>

          <a
            href="https://www.linkedin.com/company/cib-the-culinary-institute-of-bangladesh"
            target="_blank"
            rel="noopener noreferrer"
            className="social-glass-pill in"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg"
              alt="LinkedIn"
            />
            <span>LinkedIn</span>
          </a>
        </div>
      </section>

      {/* Footer Content Section */}
      <section className="footer-content-section">
        <div className="footer-blur-circle top-blur"></div>
        <div className="footer-blur-circle bottom-blur"></div>

        <div className="footer-content-container">
          {/* Contact Us Card */}
          <div className="glass-footer-card">
            <h4 className="footer-card-title">
              <span className="footer-icon-wrapper">📞</span>Contact Us
            </h4>
            <div className="contact-details">
              <p className="contact-item">
                <span className="contact-icon">🏠</span>
                <span>
                  House-160 (1st Floor), Lake Circus, Kalabagan, Dhanmondi,
                  Dhaka 1205
                </span>
              </p>
              <p className="contact-item">
                <span className="contact-icon">📱</span>
                <a href="tel:+8801338958997" className="glass-link">
                  01338-958997 (WhatsApp)
                </a>
              </p>
              <p className="contact-item">
                <span className="contact-icon">📱</span>
                <a href="tel:+8801742989255" className="glass-link">
                  01742-989255
                </a>
              </p>
              <p className="contact-item">
                <span className="contact-icon">✉️</span>
                <a href="mailto:cib.dhk@gmail.com" className="glass-link">
                  cib.dhk@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="glass-footer-card">
            <h4 className="footer-card-title">
              <span className="footer-icon-wrapper">🔗</span>Quick Links
            </h4>
            <div className="quick-links">
              <a href="https://cibdhk.com/faq/" className="glass-link-item">
                <span className="link-icon">❓</span> FAQ
              </a>
              <a href="https://cibdhk.com/gallery/" className="glass-link-item">
                <span className="link-icon">🖼️</span> Gallery
              </a>
              <a
                href="https://cibdhk.com/verification/"
                className="glass-link-item"
              >
                <span className="link-icon">✅</span> Certificate Verification
              </a>
              <a
                href="https://maps.app.goo.gl/DrphHWpqJNEYG1YC7"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-link-item"
              >
                <span className="link-icon">🗺️</span> Find Us on Map
              </a>
            </div>
          </div>

          {/* Important Links Card */}
          <div className="glass-footer-card">
            <h4 className="footer-card-title">
              <span className="footer-icon-wrapper">📚</span>Important Links
            </h4>
            <ul className="important-links">
              <li>
                <a
                  href="https://cibdhk.com/companyprofile/"
                  className="glass-link-nav highlight"
                >
                  ★ Company Profile
                </a>
              </li>
              <li>
                <a href="https://cibdhk.com/about/" className="glass-link-nav">
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="https://cibdhk.com/admission/"
                  className="glass-link-nav"
                >
                  Admission
                </a>
              </li>
              <li>
                <a
                  href="https://cibdhk.com/courses/"
                  className="glass-link-nav"
                >
                  Courses
                </a>
              </li>
              <li>
                <a href="https://cibdhk.com/blog/" className="glass-link-nav">
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="https://cibdhk.com/contact/"
                  className="glass-link-nav"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="https://cibdhk.com/privacy-policy/"
                  className="glass-link-nav privacy"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer Bottom Section */}
      <footer className="footer-bottom">
        <div className="footer-bottom-container">
          <div className="footer-logo">
            <img
              src="http://cibdhk.com/wp-content/uploads/2020/02/White-Modern-Fashion-Instagram-Profile-Picture-2.png"
              alt="CIB Logo"
              className="logo-image"
            />
          </div>

          <div className="footer-copyright">
            <p className="copyright-text">
              © <span id="currentYear"></span>
              <strong>The Culinary Institute of Bangladesh</strong>. All rights
              reserved.
            </p>
            <p className="developer-credit">
              Developed by:
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="developer-link"
              >
                Esthiyak Ahmmed
              </a>
            </p>
          </div>

          <div className="footer-top-btn">
            <button onClick={scrollToTop} className="glass-top-btn">
              <span>↑</span> Back to Top
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
