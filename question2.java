import java.util.*;

public class question2 {
    public static boolean isPalindrome(String s) {
        StringBuilder newString = new StringBuilder();
        for (char c : s.toCharArray()) {
            if(Character.isLetter(c)) {
                newString.append(Character.toLowerCase(c));
            }
            else if(Character.isDigit(c)) {
                newString.append(Character.toLowerCase(c));
            }
        }
        String filteredStr = newString.toString();
        int left = 0, right = filteredStr.length() - 1;
        while (left < right) {
            if (filteredStr.charAt(left) != filteredStr.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String input = sc.nextLine();
        System.out.println(isPalindrome(input));
        sc.close();
    }
}