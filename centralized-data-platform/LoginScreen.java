import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Random;
import javax.imageio.ImageIO;
import javax.swing.*;
import javax.swing.border.CompoundBorder;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;
import javax.swing.border.MatteBorder;

public class LoginScreen extends JFrame {

    // --- CONFIGURATION ---
    private static final String IMAGE_SOURCE = "centralized-data-platform\\login page image.jpg"; 
    private static final String REACT_APP_URL = "http://localhost:5173"; 

    // --- TECHNICAL DARK PALETTE ---
    private static final Color BG_MAIN = new Color(30, 30, 30);       
    private static final Color ACCENT_BLUE = new Color(0, 122, 204);  
    private static final Color ACCENT_HOVER = new Color(0, 100, 180); 
    private static final Color TEXT_HEADER = new Color(220, 220, 220);
    private static final Color TEXT_LABEL = new Color(150, 150, 150); 
    private static final Color BORDER_COLOR = new Color(60, 60, 60);  
    private static final Color INPUT_BG = new Color(45, 45, 45);      
    private static final Color SUCCESS_GREEN = new Color(80, 200, 120);

    private String currentOtp = "";
    private JTextField txtEmail, txtPhone, txtOtpInput;
    private JButton btnGetOtp, btnLogin;
    private JLabel lblStatus;
    private BufferedImage brandImage;

    public LoginScreen() {
        setTitle("Vasu's Brakes // Auth Gateway");
        
        // --- 1. FULL SCREEN SETTINGS ---
        // Instead of setSize, we use this to fill the screen
        setExtendedState(JFrame.MAXIMIZED_BOTH); 
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setUndecorated(true); // Removes the top bar for a true kiosk feel

        // --- 2. LOAD IMAGE ---
       try {
            brandImage = ImageIO.read(new File(IMAGE_SOURCE));
        } catch (IOException e) {
            // Fallback for absolute path if needed
            try {
                brandImage = ImageIO.read(new File("centralized-data-platform\\login page image.jpg"));
            } catch (Exception ex) {
                System.err.println("Image load failed.");
            }
        }

        JPanel mainContainer = new JPanel(new GridLayout(1, 2));
        add(mainContainer);

        // --- LEFT PANEL: IMAGE + TEXT OVERLAY ---
        JPanel leftPanel = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2d = (Graphics2D) g;
                g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

                int w = getWidth();
                int h = getHeight();

                // 1. Draw Image
                if (brandImage != null) {
                    double scaleX = (double) w / brandImage.getWidth();
                    double scaleY = (double) h / brandImage.getHeight();
                    double scale = Math.max(scaleX, scaleY); 
                    
                    int scaledWidth = (int) (brandImage.getWidth() * scale);
                    int scaledHeight = (int) (brandImage.getHeight() * scale);
                    int x = (w - scaledWidth) / 2;
                    int y = (h - scaledHeight) / 2;
                    g2d.drawImage(brandImage, x, y, scaledWidth, scaledHeight, null);
                } else {
                    g2d.setColor(BG_MAIN);
                    g2d.fillRect(0, 0, w, h);
                }
                
                // 2. Draw Dark Overlay
                g2d.setColor(new Color(0, 0, 0, 160)); 
                g2d.fillRect(0, 0, w, h);

                // 3. Draw Title
                String title = "VASU'S BRAKES INDIA";
                g2d.setFont(new Font("Segoe UI", Font.BOLD, 48)); // Made bigger for Full Screen
                g2d.setColor(Color.WHITE);
                
                FontMetrics fmTitle = g2d.getFontMetrics();
                int titleW = fmTitle.stringWidth(title);
                int titleH = fmTitle.getAscent();
                
                // 4. Draw Subtitle
                String subtitle = "Data Centralization Platform";
                g2d.setFont(new Font("Segoe UI", Font.PLAIN, 28)); // Made bigger for Full Screen
                g2d.setColor(new Color(200, 200, 200)); 
                
                FontMetrics fmSub = g2d.getFontMetrics();
                int subW = fmSub.stringWidth(subtitle);
                int subH = fmSub.getAscent();

                // 5. Center Logic
                int totalTextHeight = titleH + subH + 20; 
                int startY = (h - totalTextHeight) / 2 + titleH;

                g2d.setFont(new Font("Segoe UI", Font.BOLD, 48));
                g2d.drawString(title, (w - titleW) / 2, startY);
                
                g2d.setFont(new Font("Segoe UI", Font.PLAIN, 28)); 
                g2d.drawString(subtitle, (w - subW) / 2, startY + 60); 
            }
        };
        leftPanel.setLayout(new BorderLayout());


        // --- RIGHT PANEL: LOGIN FORM ---
        // We use GridBagLayout to center the login box in the middle of the right screen
        JPanel rightPanel = new JPanel(new GridBagLayout()); 
        rightPanel.setBackground(BG_MAIN);
        
        // Close Button (Fixed to Top Right)
        JPanel closePanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        closePanel.setOpaque(false);
        JButton btnClose = new JButton("X");
        styleIconBtn(btnClose);
        btnClose.addActionListener(e -> System.exit(0));
        closePanel.add(btnClose);
        
        // This is a trick to put the close button at the absolute top-right
        JPanel rightContainer = new JPanel(new BorderLayout());
        rightContainer.setBackground(BG_MAIN);
        rightContainer.add(closePanel, BorderLayout.NORTH);
        
        // The actual Login Form Box
        JPanel formBox = new JPanel();
        formBox.setLayout(new BoxLayout(formBox, BoxLayout.Y_AXIS));
        formBox.setBackground(BG_MAIN);
        formBox.setPreferredSize(new Dimension(400, 600)); // Fixed size form
        
        // --- FORM ELEMENTS ---
        JLabel lblLoginHeader = new JLabel("AUTHENTICATE");
        lblLoginHeader.setFont(new Font("Segoe UI", Font.BOLD, 24));
        lblLoginHeader.setForeground(TEXT_HEADER);
        lblLoginHeader.setAlignmentX(Component.LEFT_ALIGNMENT);

        JPanel statusPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 5, 0));
        statusPanel.setOpaque(false);
        statusPanel.setAlignmentX(Component.LEFT_ALIGNMENT);
        
        JPanel greenDot = new JPanel();
        greenDot.setPreferredSize(new Dimension(8, 8));
        greenDot.setBackground(SUCCESS_GREEN);
        greenDot.setBorder(new LineBorder(BG_MAIN, 1));
        
        lblStatus = new JLabel("System Operational");
        lblStatus.setFont(new Font("Consolas", Font.PLAIN, 12));
        lblStatus.setForeground(TEXT_LABEL);
        
        statusPanel.add(greenDot);
        statusPanel.add(lblStatus);

        JLabel lblEmail = new JLabel("USER_ID / EMAIL");
        styleTechLabel(lblEmail);
        txtEmail = new JTextField();
        styleTechField(txtEmail);

        JLabel lblPhone = new JLabel("PHONE NUMBER");
        styleTechLabel(lblPhone);
        txtPhone = new JTextField();
        styleTechField(txtPhone);

        btnGetOtp = new JButton("GENERATE OTP");
        styleSecondaryBtn(btnGetOtp);

        JSeparator sep = new JSeparator();
        sep.setForeground(BORDER_COLOR);
        sep.setBackground(BG_MAIN);
        sep.setMaximumSize(new Dimension(Integer.MAX_VALUE, 1));

        JLabel lblOtp = new JLabel("SECURITY_TOKEN (OTP)");
        styleTechLabel(lblOtp);
        txtOtpInput = new JTextField();
        styleTechField(txtOtpInput);
        txtOtpInput.setEnabled(false);

        btnLogin = new JButton("INITIALIZE SESSION >");
        stylePrimaryBtn(btnLogin);
        btnLogin.setEnabled(false);

        // Add to Form Box with Spacing
        formBox.add(lblLoginHeader);
        formBox.add(Box.createVerticalStrut(10));
        formBox.add(statusPanel);
        formBox.add(Box.createVerticalStrut(40));
        formBox.add(lblEmail);
        formBox.add(Box.createVerticalStrut(5));
        formBox.add(txtEmail);
        formBox.add(Box.createVerticalStrut(20));
        formBox.add(lblPhone);
        formBox.add(Box.createVerticalStrut(5));
        formBox.add(txtPhone);
        formBox.add(Box.createVerticalStrut(20));
        formBox.add(btnGetOtp);
        formBox.add(Box.createVerticalStrut(30));
        formBox.add(sep);
        formBox.add(Box.createVerticalStrut(30));
        formBox.add(lblOtp);
        formBox.add(Box.createVerticalStrut(5));
        formBox.add(txtOtpInput);
        formBox.add(Box.createVerticalStrut(40));
        formBox.add(btnLogin);

        // Add Form Box to Center of Right Panel
        rightPanel.add(formBox);
        
        // Combine Close Button + Form
        rightContainer.add(rightPanel, BorderLayout.CENTER);

        mainContainer.add(leftPanel);
        mainContainer.add(rightContainer);

        // --- LOGIC ---
        btnGetOtp.addActionListener(e -> {
            if(txtEmail.getText().trim().isEmpty() || txtPhone.getText().trim().isEmpty()) {
                lblStatus.setText("ERR: MISSING_INPUT");
                lblStatus.setForeground(new Color(255, 80, 80));
                return;
            }
            Random rand = new Random();
            int otpCode = 1000 + rand.nextInt(9000);
            currentOtp = String.valueOf(otpCode);
            JOptionPane.showMessageDialog(this, 
                "AUTHENTICATION SERVER:\nOTP Generated: " + currentOtp, 
                "SysAdmin Message", JOptionPane.INFORMATION_MESSAGE);
            txtOtpInput.setEnabled(true);
            txtOtpInput.requestFocus();
            btnLogin.setEnabled(true);
            txtOtpInput.setBackground(INPUT_BG);
            lblStatus.setText("WAITING FOR TOKEN...");
            lblStatus.setForeground(new Color(255, 200, 0));
        });

        btnLogin.addActionListener(e -> {
            if (txtOtpInput.getText().trim().equals(currentOtp)) {
                try {
                    String userEmail = txtEmail.getText().trim();
                    String encodedEmail = URLEncoder.encode(userEmail, StandardCharsets.UTF_8);
                    String targetUrl = REACT_APP_URL + "/?email=" + encodedEmail + "&auth=success";

                    if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                        Desktop.getDesktop().browse(new URI(targetUrl));
                    } else {
                        System.err.println("Browser launch not supported.");
                    }
                    this.dispose(); 
                } catch (Exception ex) {
                    ex.printStackTrace();
                    lblStatus.setText("ERR: LAUNCH_FAILED");
                    lblStatus.setForeground(new Color(255, 80, 80));
                }
            } else {
                lblStatus.setText("ERR: INVALID_TOKEN");
                lblStatus.setForeground(new Color(255, 80, 80));
                txtOtpInput.setBorder(new LineBorder(new Color(255, 80, 80), 1));
            }
        });
    }

    // --- TECHNICAL STYLING ---
    private void styleTechLabel(JLabel lbl) {
        lbl.setFont(new Font("Consolas", Font.BOLD, 14)); // Slightly bigger for fullscreen
        lbl.setForeground(TEXT_LABEL);
        lbl.setAlignmentX(Component.LEFT_ALIGNMENT);
    }

    private void styleTechField(JTextField field) {
        field.setMaximumSize(new Dimension(Integer.MAX_VALUE, 40));
        field.setBackground(INPUT_BG);
        field.setForeground(Color.WHITE);
        field.setCaretColor(ACCENT_BLUE);
        field.setBorder(new CompoundBorder(
            new MatteBorder(0, 0, 1, 0, BORDER_COLOR), 
            new EmptyBorder(5, 5, 5, 5)
        ));
        field.setFont(new Font("Consolas", Font.PLAIN, 16));
        field.setAlignmentX(Component.LEFT_ALIGNMENT);
    }

    private void stylePrimaryBtn(JButton btn) {
        btn.setMaximumSize(new Dimension(Integer.MAX_VALUE, 50));
        btn.setBackground(ACCENT_BLUE);
        btn.setForeground(Color.WHITE);
        btn.setFont(new Font("Segoe UI", Font.BOLD, 14));
        btn.setFocusPainted(false);
        btn.setBorder(new LineBorder(ACCENT_BLUE));
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        btn.setAlignmentX(Component.LEFT_ALIGNMENT);
        
        btn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { if(btn.isEnabled()) btn.setBackground(ACCENT_HOVER); }
            public void mouseExited(MouseEvent e) { if(btn.isEnabled()) btn.setBackground(ACCENT_BLUE); }
        });
        btn.addPropertyChangeListener("enabled", evt -> {
            if(!(boolean)evt.getNewValue()) {
                btn.setBackground(new Color(45, 45, 45));
                btn.setBorder(new LineBorder(new Color(60, 60, 60)));
                btn.setForeground(new Color(100, 100, 100));
            } else {
                btn.setBackground(ACCENT_BLUE);
                btn.setBorder(new LineBorder(ACCENT_BLUE));
                btn.setForeground(Color.WHITE);
            }
        });
    }

    private void styleSecondaryBtn(JButton btn) {
        btn.setMaximumSize(new Dimension(150, 30));
        btn.setBackground(BG_MAIN);
        btn.setForeground(ACCENT_BLUE);
        btn.setFont(new Font("Consolas", Font.PLAIN, 12));
        btn.setFocusPainted(false);
        btn.setBorder(new LineBorder(BORDER_COLOR)); 
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        btn.setAlignmentX(Component.LEFT_ALIGNMENT);
        
        btn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { btn.setBorder(new LineBorder(ACCENT_BLUE)); }
            public void mouseExited(MouseEvent e) { btn.setBorder(new LineBorder(BORDER_COLOR)); }
        });
    }
    
    private void styleIconBtn(JButton btn) {
        btn.setBackground(BG_MAIN);
        btn.setForeground(TEXT_LABEL);
        btn.setFont(new Font("Arial", Font.PLAIN, 20)); // Bigger close button
        btn.setBorder(new EmptyBorder(10, 10, 10, 20)); // Padding for top-right corner
        btn.setFocusPainted(false);
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        btn.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) { btn.setForeground(Color.WHITE); }
            public void mouseExited(MouseEvent e) { btn.setForeground(TEXT_LABEL); }
        });
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new LoginScreen().setVisible(true));
    }
}