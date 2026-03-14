// utils/emailTemplates.js

export const getCertificateEmailTemplate = (student) => {
  const currentYear = new Date().getFullYear();
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Official Certificate</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; -webkit-font-smoothing: antialiased; }
        table { border-spacing: 0; border-collapse: collapse; width: 100%; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.05); }
        .header { background-color: #111111; padding: 40px 20px; text-align: center; }
        .header h1 { color: #c5a059; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
        .body-content { padding: 40px 40px 20px; color: #333333; line-height: 1.6; }
        .body-content h2 { color: #111111; font-size: 20px; margin-top: 0; margin-bottom: 20px; }
        .body-content p { font-size: 15px; margin-bottom: 20px; color: #555555; }
        .course-name { font-weight: 700; color: #111111; }
        .highlight-box { background-color: #fcfaf5; border: 1px solid #f0e6d2; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center; }
        .highlight-box p { margin: 0; color: #8a6d3b; font-size: 14px; font-weight: 500; }
        .footer { padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #eeeeee; text-align: center; }
        .footer p { margin: 0 0 10px; font-size: 13px; color: #888888; }
        .footer a { color: #c5a059; text-decoration: none; font-weight: 600; }
        .social-links { margin-top: 15px; }
        .social-links span { margin: 0 10px; font-size: 12px; color: #bbbbbb; }
        
        /* Mobile Responsiveness */
        @media only screen and (max-width: 600px) {
          .container { margin: 15px !important; border-radius: 8px !important; }
          .header { padding: 30px 15px !important; }
          .body-content { padding: 30px 20px 15px !important; }
          .footer { padding: 25px 20px !important; }
        }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td>
            <div class="container">
              <div class="header">
                <h1>Culinary Institute<br><span style="font-size: 14px; color: #ffffff; letter-spacing: 2px; font-weight: 400;">Of Bangladesh</span></h1>
              </div>
              
              <div class="body-content">
                <h2>Congratulations, ${student.student_name}!</h2>
                
                <p>We are incredibly proud of your hard work and dedication. It is with great pleasure that we present your official certificate for successfully completing the <span class="course-name">"${student.course_name || 'Professional Culinary Course'}"</span>.</p>
                
                <div class="highlight-box">
                  <p>Your high-resolution digital certificate is attached to this email as a PDF document.</p>
                </div>
                
                <p>You can easily verify the authenticity of this certificate at any time by scanning the QR code printed on the bottom left corner of the document.</p>
                
                <p style="margin-top: 30px; margin-bottom: 5px;">Wishing you a successful and flavorful culinary journey ahead,</p>
                <p style="font-weight: 600; color: #111111; margin-top: 0;">The CIB Administration</p>
              </div>
              
              <div class="footer">
                <p>Need assistance? Contact us at <a href="mailto:contact@cibdhk.com">contact@cibdhk.com</a></p>
                <p><a href="https://www.cibdhk.com" target="_blank">www.cibdhk.com</a></p>
                <div class="social-links">
                  <span>© ${currentYear} CIB. All rights reserved.</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};