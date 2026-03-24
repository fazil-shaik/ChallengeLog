import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/app/db/index';
import { users } from '@/app/(Schema)/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name, password } = body;

        if (!email || !name || !password) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const existingQuery = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingQuery.length > 0) {
            return NextResponse.json({ message: "User already exists" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.insert(users).values({
            email,
            name,
            password: hashedPassword,
        });

        return NextResponse.json({ message: "User created" }, { status: 201 });
    } catch (error) {
        console.error("Error registering user:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
