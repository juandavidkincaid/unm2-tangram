import React, { useReducer, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import clsx from 'clsx';
import { EventEmitter } from 'events';

import {
    mdiRotateLeft,
    mdiRotateRight,
    mdiVectorLine,
    mdiBug,
    mdiAnchor,
    mdiDraw,
    mdiContentSave,
    mdiMenuRight,
    mdiMenuLeft,
    mdiMenuDown,
    mdiMenuUp,
    mdiArrowLeft,
    mdiArrowRight
} from '@mdi/js';
import IconBase from '@mdi/react';
const Icon = styled(IconBase)``;

import {
    NC,
    Title
} from '@tangram-util';
import {
    ViewportStyle,
    useViewport
} from '@tangram-styling';
import { theme, app } from '@tangram-core';

import {
    Tangram
} from '@tangram-game';

const TangramGameViewLayout = styled.div`
    display: grid;
    width: 100%;
    height: 100%;

    grid-template-columns: 1fr;
    grid-template-rows: min-content 1fr min-content;
    grid-template-areas:
        "header"
        "content"
        "footer";
    grid-auto-rows: min-content;

    background-color: ${theme.c.e};

    main{
        display: grid;
        width: 100%;

        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr;
        column-gap: 20px;

        grid-area: content;
        padding: 20px;

        .canvas-holder{
            display: flex;
            width: 100%;
            height: 100%;

            place-content: center;
            background-color: ${theme.c.a};


            canvas{
                width: max(362px, 100%);
                height: max(450px, 100%);
            }    
        }

        .controls{
            display: grid;

            grid-template-columns: repeat(5, 1fr);
            grid-auto-rows: min-content;
            row-gap: 10px;
            column-gap: 10px;

            place-content: start;
            place-items: center;


            button{
                display: grid;
                width: 120px;
                height: 120px; 

                grid-template-columns: 1fr;
                grid-template-rows: 3fr 1fr;

                place-content: center;
                place-items: center;
                padding: 10px;
                background-color: ${theme.c.a};
                color: ${theme.c.e};
                border: none;
                outline: none;
                font-family: ${theme.fFamily};
                font-size: 1.2em;

                &:hover, &.on{
                    background-color: ${theme.c.d};
                    color: ${theme.c.a};
                    cursor: pointer;
                }
            }
        }
    }

    .mobile{
        display: none;
        grid-area: content;
        width: 100%;
        height: 100%;
        place-content: center;
        place-items: center;

        color: ${theme.c.a};
        font-size: 2em;
        text-align: center;
    }

    ${ViewportStyle('MobileTablet')}{
        main{
            display: none;
        }

        .mobile{
            display: flex;
        }
    }

    header{
        display: flex;
        width: 100%;
        height: 100%;

        grid-area: header;

        place-content: center;
        place-items: center;

        padding: 10px;
        color: ${theme.c.e};
        font-size: 2em;
        font-family: ${theme.fTitle};
    }

    footer{
        display: flex;
        width: 100%;
        height: 100%;

        grid-area: footer;

        place-content: center;
        place-items: center;
        padding: 10px;
        color: ${theme.c.e};

        a{
            text-decoration: none;
            color: inherit;
        }
    }

    header, footer, .canvas-holder, button{
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        transition: 0.3s;
        background-color: ${theme.c.a};

        &:hover{
            box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
        }
    }
`;

const TangramGameView = NC('TangramGameView', ({ children }) => {
    const canvasRef = useRef<null | HTMLCanvasElement>(null);
    const forceUpdate = useReducer((s)=>s+1, 0)[1];
    const vp = useViewport();
    const tangram = useMemo<Tangram>(() => new Tangram(), []);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            tangram.forceReactUpdate = forceUpdate;
            tangram.canvas = canvas;
            tangram.startGame();
        }
    }, []);

    useEffect(()=>{
        if(canvasRef.current){
            const canvas = canvasRef.current;
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            tangram.settleSize();
        }
    }, [vp]);

    return <TangramGameViewLayout>
        <header>
            The Tangram Game
        </header>
        <footer>
            <span>
                By <a href="https://github.com/juandavidkincaid">@juandavidkincaid</a>, for <a href="https://unal.edu.co/">UNAL</a>
            </span>
        </footer>
        <main>
            <div className='canvas-holder'>
                <canvas ref={canvasRef} />
            </div>
            <div className='controls'>
                <button onClick={()=>{
                    if(tangram.selected){
                        tangram.selected.rotation += 45;
                    }
                }}>
                    <Icon path={mdiRotateRight} size={1.5}/>
                    <span>Rotar -45°</span>
                </button>
                <button onClick={()=>{
                    if(tangram.selected){
                        tangram.selected.rotation -= 45;
                    }
                }}>
                    <Icon path={mdiRotateLeft} size={1.5}/>
                    <span>Rotar 45°</span>
                </button>
                <button onClick={()=>{
                    if(tangram.selected){
                        tangram.selected.y -= 20;
                    }
                }}>
                    <Icon path={mdiMenuUp} size={1.5}/>
                    <span>Move Up</span>
                </button>
                <button onClick={()=>{
                    if(tangram.selected){
                        tangram.selected.y += 20;
                    }
                }}>
                    <Icon path={mdiMenuDown} size={1.5}/>
                    <span>Move Down</span>
                </button>
                <button onClick={()=>{
                    if(tangram.selected){
                        tangram.selected.x -= 20;
                    }
                }}>
                    <Icon path={mdiMenuLeft} size={1.5}/>
                    <span>Move Left</span>
                </button>
                <button onClick={()=>{
                    if(tangram.selected){
                        tangram.selected.x += 20;
                    }
                }}>
                    <Icon path={mdiMenuRight} size={1.5}/>
                    <span>Move Right</span>
                </button>
                <button 
                    className={tangram.store.flags.snap ? 'on' : 'off'}
                    onClick={()=>{tangram.store.flags.snap = !tangram.store.flags.snap; tangram.forceReactUpdate();}}
                >
                    <Icon path={mdiVectorLine} size={1.5}/>
                    <span>Snapping {tangram.store.flags.snap ? 'On' : 'Off'}</span>
                </button>
                <button 
                    onClick={()=>{tangram.store.flags.debugLevel = (tangram.store.flags.debugLevel + 1) % 4; tangram.forceReactUpdate();}}
                >
                    <Icon path={mdiArrowLeft} size={1.5}/>
                    <span>Anterior Nivel</span>
                </button>
                <button 
                    onClick={()=>{tangram.store.flags.debugLevel = (tangram.store.flags.debugLevel + 1) % 4; tangram.forceReactUpdate();}}
                >
                    <Icon path={mdiArrowRight} size={1.5}/>
                    <span>Siguiente Nivel</span>
                </button>

                <button 
                    className={tangram.store.flags.debugLevel >= 1 ? 'on' : 'off'}
                    onClick={()=>{tangram.store.flags.debugLevel = (tangram.store.flags.debugLevel + 1) % 4; tangram.forceReactUpdate();}}
                >
                    <Icon path={mdiBug} size={1.5}/>
                    <span>Debug {tangram.store.flags.debugLevel >= 1 ? tangram.store.flags.debugLevel : 'Off'}</span>
                </button>
                {tangram.store.flags.debugLevel >= 1 && <>
                    <button 
                        className={tangram.drawModes.has('editor-anchors') ? 'on' : 'off'}
                        onClick={()=>{
                            tangram.store.levelEditor.edit();
                        }}
                    >
                        <Icon path={mdiAnchor} size={1.5}/>
                        <span>Fijar Anclas</span>
                    </button>
                    <button
                        className={tangram.drawModes.has('editor-level') ? 'on' : 'off'}
                        onClick={()=>{
                            if(tangram.drawModes.has('editor-level')){
                                tangram.drawModes.delete('editor-level');
                            }else{
                                tangram.drawModes.add('editor-level');
                            }
                            tangram.forceReactUpdate();
                        }}
                    >
                        <Icon path={mdiDraw} size={1.5}/>
                        <span>Dibujar Nivel</span>
                    </button>
                    <button onClick={()=>{
                        tangram.store.levelEditor.export();
                    }}>
                        <Icon path={mdiContentSave} size={1.5}/>
                        <span>Exportar Nivel</span>
                    </button>
                </>}
            </div>
        </main>
        <div className='mobile'>
            This is a desktop game, not visible on mobile screens
        </div>
    </TangramGameViewLayout>;
});

export {
    TangramGameView
}
