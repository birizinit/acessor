// API Route para gerenciar dados do usuário
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";

function safeParseJSON(jsonString: string | null): any {
  if (!jsonString || jsonString.trim() === '') {
    return null;
  }
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
}

// GET - Buscar dados do usuário por email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      profileImage: user.profileImage,
      preferences: safeParseJSON(user.preferences),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuário" },
      { status: 500 }
    );
  }
}

// POST - Criar ou atualizar usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, profileImage, preferences } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const preferencesStr = preferences ? JSON.stringify(preferences) : null;

    if (existingUser) {
      const [updatedUser] = await db
        .update(users)
        .set({
          profileImage: profileImage || existingUser.profileImage,
          preferences: preferencesStr || existingUser.preferences,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();

      return NextResponse.json({
        message: "Usuário atualizado com sucesso",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          profileImage: updatedUser.profileImage,
          preferences: safeParseJSON(updatedUser.preferences),
        },
      });
    } else {
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          profileImage,
          preferences: preferencesStr,
        })
        .returning();

      return NextResponse.json({
        message: "Usuário criado com sucesso",
        user: {
          id: newUser.id,
          email: newUser.email,
          profileImage: newUser.profileImage,
          preferences: safeParseJSON(newUser.preferences),
        },
      }, { status: 201 });
    }
  } catch (error) {
    console.error("Erro ao salvar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao salvar usuário" },
      { status: 500 }
    );
  }
}
