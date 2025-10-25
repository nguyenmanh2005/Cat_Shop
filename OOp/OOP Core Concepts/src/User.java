public class User {
    private String password;
    public void setPassword(String password) {
        if (password.length() < 6) throw new RuntimeException("Weak password!");
        this.password = password;
    }
    public String getPassword() {
        return "******"; // tránh lộ
    }
}