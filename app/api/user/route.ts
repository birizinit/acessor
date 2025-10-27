// API Route para gerenciar dados do usuário
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/shared/schema";
import { eq, or } from "drizzle-orm";
import { supabase } from "@/lib/supabase";

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

// GET - Buscar dados do usuário por email ou supabaseId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const supabaseId = searchParams.get("supabaseId");

    if (!email && !supabaseId) {
      return NextResponse.json(
        { error: "Email ou supabaseId é obrigatório" },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(
        or(
          email ? eq(users.email, email) : undefined,
          supabaseId ? eq(users.supabaseId, supabaseId) : undefined
        )
      )
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      supabaseId: user.supabaseId,
      email: user.email,
      fullName: user.fullName,
      profileImage: user.profileImage,
      apiToken: user.apiToken,
      phone: user.phone,
      cpf: user.cpf,
      birthDate: user.birthDate,
      country: user.country,
      city: user.city,
      gender: user.gender,
      language: user.language,
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
    const { 
      supabaseId, 
      email, 
      fullName, 
      profileImage, 
      apiToken, 
      phone, 
      cpf, 
      birthDate, 
      country, 
      city, 
      gender, 
      language, 
      preferences 
    } = body;

    if (!email && !supabaseId) {
      return NextResponse.json(
        { error: "Email ou supabaseId é obrigatório" },
        { status: 400 }
      );
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(
        or(
          email ? eq(users.email, email) : undefined,
          supabaseId ? eq(users.supabaseId, supabaseId) : undefined
        )
      )
      .limit(1);

    const preferencesStr = preferences ? JSON.stringify(preferences) : null;

    if (existingUser) {
      const [updatedUser] = await db
        .update(users)
        .set({
          fullName: fullName || existingUser.fullName,
          profileImage: profileImage || existingUser.profileImage,
          apiToken: apiToken || existingUser.apiToken,
          phone: phone || existingUser.phone,
          cpf: cpf || existingUser.cpf,
          birthDate: birthDate || existingUser.birthDate,
          country: country || existingUser.country,
          city: city || existingUser.city,
          gender: gender || existingUser.gender,
          language: language || existingUser.language,
          preferences: preferencesStr || existingUser.preferences,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();

      return NextResponse.json({
        message: "Usuário atualizado com sucesso",
        user: {
          id: updatedUser.id,
          supabaseId: updatedUser.supabaseId,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          profileImage: updatedUser.profileImage,
          apiToken: updatedUser.apiToken,
          phone: updatedUser.phone,
          cpf: updatedUser.cpf,
          birthDate: updatedUser.birthDate,
          country: updatedUser.country,
          city: updatedUser.city,
          gender: updatedUser.gender,
          language: updatedUser.language,
          preferences: safeParseJSON(updatedUser.preferences),
        },
      });
    } else {
      const [newUser] = await db
        .insert(users)
        .values({
          supabaseId,
          email,
          fullName,
          profileImage,
          apiToken,
          phone,
          cpf,
          birthDate,
          country,
          city,
          gender,
          language,
          preferences: preferencesStr,
        })
        .returning();

      return NextResponse.json({
        message: "Usuário criado com sucesso",
        user: {
          id: newUser.id,
          supabaseId: newUser.supabaseId,
          email: newUser.email,
          fullName: newUser.fullName,
          profileImage: newUser.profileImage,
          apiToken: newUser.apiToken,
          phone: newUser.phone,
          cpf: newUser.cpf,
          birthDate: newUser.birthDate,
          country: newUser.country,
          city: newUser.city,
          gender: newUser.gender,
          language: newUser.language,
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
