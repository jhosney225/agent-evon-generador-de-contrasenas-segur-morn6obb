
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

// Function to calculate entropy
function calculateEntropy(password) {
  const charsets = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    digits: "0123456789",
    special: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };

  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += charsets.lowercase.length;
  if (/[A-Z]/.test(password)) charsetSize += charsets.uppercase.length;
  if (/[0-9]/.test(password)) charsetSize += charsets.digits.length;
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password))
    charsetSize += charsets.special.length;

  const entropy = password.length * Math.log2(charsetSize);
  return {
    entropy: entropy.toFixed(2),
    charsetSize,
    strength: getStrengthLevel(entropy),
  };
}

// Function to get strength level based on entropy
function getStrengthLevel(entropy) {
  if (entropy < 30) return "Very Weak";
  if (entropy < 60) return "Weak";
  if (entropy < 90) return "Fair";
  if (entropy < 120) return "Strong";
  return "Very Strong";
}

// Function to validate password requirements
function validatePassword(password) {
  const requirements = {
    length: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    digits: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
  };

  return requirements;
}

// Main function to interact with Claude
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) => {
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  };

  console.log("\n🔐 Secure Password Generator with Entropy Meter");
  console.log("=".repeat(50));

  const conversationHistory = [];

  // Start the conversation with Claude
  while (true) {
    const userInput = await question("\nYou: ");

    if (
      userInput.toLowerCase() === "exit" ||
      userInput.toLowerCase() === "quit"
    ) {
      console.log(
        "\n👋 Thank you for using the Password Generator. Goodbye!"
      );
      rl.close();
      break;
    }

    conversationHistory.push({
      role: "user",
      content: userInput,
    });

    // Prepare the system message
    const systemMessage = `You are a security expert helping users generate secure passwords and understand password security.
    
You have access to a password generator and entropy calculator. When a user asks for:
1. Password generation: Generate a secure password and explain its entropy score
2. Password analysis: Analyze the strength of any provided password
3. Security advice: Provide guidance on creating secure passwords

Always be helpful and explain security concepts in simple terms.

Examples of responses:
- For password generation requests, suggest using 16+ characters with mixed case, numbers, and special characters
- Explain entropy as how unpredictable a password is (higher is better)
- Recommend using unique passwords for different services
- Warn against using personal information in passwords`;

    try {
      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: systemMessage,
        messages: conversationHistory,
      });

      const assistantMessage = response.content[0].text;
      conversationHistory.push({
        role: "assistant",
        content: assistantMessage,
      });

      console.log("\nAssistant: " + assistantMessage);

      // Check if user asked for password generation
      if (
        userInput.toLowerCase().includes("generate") &&
        userInput.toLowerCase().includes("password")
      ) {
        // Generate a sample secure password
        const generatedPassword = generateSecurePassword();
        const entropyData = calculateEntropy(generatedPassword);
        const requirements = validatePassword(generatedPassword);

        console.log("\n📊 Generated Password Analysis:");
        console.log("-".repeat(50));
        console.log(`Generated Password: ${generatedPassword}`);
        console.log(`Entropy Score: ${entropyData.entropy} bits`);
        console.log(`Strength Level: ${entropyData.strength}`);
        console.log(`Character Set Size: ${entropyData.charsetSize}`);
        console.log(
          `Password Length: ${generatedPassword.length} characters\n`
        );
        console.log("Requirements Met:");
        console.log(`  ✓ At least 12 characters: ${requirements.length ? "✅" : "❌"}`);
        console.log(`  ✓ Lowercase letters: ${requirements.lowercase ? "✅" : "❌"}`);
        console.log(`  ✓ Uppercase letters: ${requirements.uppercase ? "✅" : "❌"}`);
        console.log(`  ✓ Digits: ${requirements.digits ? "✅" : "❌"}`);
        console.log(
          `  ✓ Special characters: ${requirements.special ? "✅" : "❌"}\n`
        );
      }

      // Check if user is asking to analyze a password
      if (
        user