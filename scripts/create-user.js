import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import readline from 'readline';

const prisma = new PrismaClient();

// Create readline interface for CLI prompts
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to prompt for input
/**
 * @param {string} question 
 * @returns {Promise<string>}
 */
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

// Function to prompt for password (hidden input)
/**
 * @param {string} question 
 * @returns {Promise<string>}
 */
function promptPassword(question) {
    return new Promise((resolve) => {
        const stdin = process.stdin;
        const stdout = process.stdout;

        stdout.write(question);
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');

        let password = '';

        stdin.on('data', function (char) {
            const charStr = char.toString();

            switch (charStr) {
                case '\n':
                case '\r':
                case '\u0004': // Ctrl+D
                    stdin.setRawMode(false);
                    stdin.pause();
                    stdout.write('\n');
                    resolve(password);
                    break;
                case '\u0003': // Ctrl+C
                    process.exit();
                    break;
                case '\u007f': // Backspace
                case '\b':
                    if (password.length > 0) {
                        password = password.slice(0, -1);
                        stdout.write('\b \b');
                    }
                    break;
                default:
                    password += charStr;
                    stdout.write('*');
                    break;
            }
        });
    });
}

async function createUser() {
    try {
        console.log('🚀 conversen Dataset Tool - Create New User\n');

        // Get username
        const username = await prompt('Enter username: ');

        if (!username.trim()) {
            console.log('❌ Username cannot be empty!');
            process.exit(1);
        }

        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
            where: { username: username.trim() }
        });

        if (existingUser) {
            console.log('❌ Username already exists! Please choose a different username.');
            process.exit(1);
        }

        // Get password
        const password = await promptPassword('Enter password: ');

        if (!password.trim()) {
            console.log('❌ Password cannot be empty!');
            process.exit(1);
        }

        // Confirm password
        const confirmPassword = await promptPassword('Confirm password: ');

        if (password !== confirmPassword) {
            console.log('❌ Passwords do not match!');
            process.exit(1);
        }

        // Hash password with MD5
        const hashedPassword = createHash('md5').update(password).digest('hex');

        // Create user in database
        const user = await prisma.user.create({
            data: {
                username: username.trim(),
                password: hashedPassword,
            },
        });

        console.log('\n✅ User created successfully!');
        console.log(`👤 Username: ${user.username}`);
        console.log(`🆔 User ID: ${user.id}`);
        console.log(`🗓️  Created: ${user.createdAt.toLocaleString()}`);
        console.log(`🔒 Password Hash: ${hashedPassword}`);

    } catch (error) {
        console.error('❌ Error creating user:', error instanceof Error ? error.message : String(error));
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n👋 Goodbye!');
    rl.close();
    await prisma.$disconnect();
    process.exit(0);
});

createUser(); 