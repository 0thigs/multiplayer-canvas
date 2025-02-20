import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: Request, 
  { params }: { params: { roomId: string } }
) {
  try {
    const { canvasState } = await req.json();
    const { roomId } = params;

    console.log('Canvas update request received:', { 
      roomId, 
      canvasStateLength: canvasState?.length 
    });

    if (!roomId) {
      console.error('Room ID is required');
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    if (!canvasState || canvasState.length < 10) {
      console.error('Invalid canvas state');
      return NextResponse.json(
        { error: 'Invalid canvas state' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('rooms')
      .update({ canvas_state: canvasState })
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      console.error('Database update error:', {
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json(
        { 
          error: 'Failed to update canvas', 
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Canvas updated successfully',
      updatedAt: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    console.error('Unexpected error in canvas update:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}