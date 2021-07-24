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
    mdiContentSave
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
} from './controller';

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
            display: flex;

            flex-flow: row wrap;
            justify-content: space-between;

            button{
                display: grid;
                width: 100px;
                height: 100px; 

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
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
                tangram.forceReactUpdate = forceUpdate;
                tangram.canvas = canvas;
                tangram.ctx = ctx;
                tangram.settleSize();
                tangram.startGame();
            }
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
                    if(tangram.selectedShape){
                        tangram.selectedShape.rotation += 45;
                    }
                }}>
                    <Icon path={mdiRotateLeft} size={1.5}/>
                    <span>Rotar 45°</span>
                </button>
                <button 
                    className={tangram.flags.debugLevel >= 1 ? 'on' : 'off'}
                    onClick={()=>{tangram.flags.debugLevel = (tangram.flags.debugLevel + 1) % 4; tangram.forceReactUpdate();}}
                >
                    <Icon path={mdiBug} size={1.5}/>
                    <span>Debug {tangram.flags.debugLevel >= 1 ? tangram.flags.debugLevel : 'Off'}</span>
                </button>
                {/* <button 
                    className={tangram.flags.snaping ? 'on' : 'off'}
                    onClick={()=>{tangram.flags.snaping = !tangram.flags.snaping; tangram.forceReactUpdate();}}
                >
                    <Icon path={mdiVectorLine} size={1.5}/>
                    <span>Snaping {tangram.flags.snaping ? 'On' : 'Off'}</span>
                </button> */}
                {tangram.flags.debugLevel >= 1 && <>
                    <button 
                        onClick={()=>tangram.setAnchors()}
                    >
                        <Icon path={mdiAnchor} size={1.5}/>
                        <span>Fijar Anclas</span>
                    </button>
                    <button
                        className={tangram.flags.drawLevel ? 'on' : 'off'}
                        onClick={()=>{
                            tangram.flags.drawLevel = !tangram.flags.drawLevel; tangram.forceReactUpdate();
                        }}
                    >
                        <Icon path={mdiDraw} size={1.5}/>
                        <span>Dibujar Nivel</span>
                    </button>
                    <button onClick={()=>{
                        tangram.saveLevel();
                    }}>
                        <Icon path={mdiContentSave} size={1.5}/>
                        <span>Guardar Nivel</span>
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
