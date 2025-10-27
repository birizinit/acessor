// API Route para gerenciar dados do usuário
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

// GET - Buscar dados do usuário autenticado
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Buscar dados do usuário na tabela users
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: userProfile.id,
      email: userProfile.email,
      nome: userProfile.nome,
      sobrenome: userProfile.sobrenome,
      cpf: userProfile.cpf,
      telefone: userProfile.telefone,
      nascimento: userProfile.nascimento,
      api_token: userProfile.api_token,
      created_at: userProfile.created_at,
      updated_at: userProfile.updated_at,
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuário" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar dados do usuário
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nome, sobrenome, cpf, telefone, nascimento, api_token } = body;

    // Atualizar dados do usuário
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        nome: nome || undefined,
        sobrenome: sobrenome || undefined,
        cpf: cpf || undefined,
        telefone: telefone || undefined,
        nascimento: nascimento || undefined,
        api_token: api_token || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: "Erro ao atualizar usuário: " + updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Usuário atualizado com sucesso",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        nome: updatedUser.nome,
        sobrenome: updatedUser.sobrenome,
        cpf: updatedUser.cpf,
        telefone: updatedUser.telefone,
        nascimento: updatedUser.nascimento,
        api_token: updatedUser.api_token,
        updated_at: updatedUser.updated_at,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}