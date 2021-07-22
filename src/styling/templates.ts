import {keyframes, css} from 'styled-components';
import {ThemeProxy} from '.';

const KeyFrames = {
    spin: keyframes`
        from {
            transform: rotate(0deg);
        }
        
        to {
            transform: rotate(360deg);
        }
    `,
    leftright: keyframes`
        from {
            left: 0%;
        }
        
        to {
            left: 100%;
        }
    `,
    fadein: keyframes`
        from {
            opacity: 0;
        }
        
        to {
            opacity: 1;
        }
    `,
    fadeout: keyframes`
        from {
            opacity: 1;
        }
        
        to {
            opacity: 0;
        }
    `
};

const CardStyle = (color: string='rgba(0,0,0,0.2)')=>(`
    box-shadow: 0 4px 8px 0 ${color};
    transition: 0.3s;
    &:hover{
        box-shadow: 0 8px 16px 0 ${color};
    }
`);

const ButtonStyle = (theme: ThemeProxy, mode='normal')=>(css`
    display: flex;
    place-content: center;
    place-items: center;
    border: none;
    outline: none;
    ${mode === 'normal' ? css`
        background-color: ${theme.c.wh};
        border: 1px solid ${theme.c.b};
        color: ${theme.c.b};
    `: ''}
    ${mode === 'dark' ? css`
        background-color: ${theme.c.b};
        border: 1px solid ${theme.c.b};
        color: ${theme.c.e};
    `: ''}
    font-family: ${theme.fFamily};
    font-size: calc(${theme.fSize} * 1.3);
    border-radius: 4px;
    cursor: pointer;

    &[disabled]{
        border: #404040;
        background-color: #404040;
        color: #c0c0c0;
        cursor: not-allowed;
        pointer-events: none;
    }

    &.loading{
        cursor: wait;
        pointer-events: none;

        .icon-holder{
            width: 10%;
            justify-content: center;
            align-items: center;
            .icon{
                animation: ${KeyFrames.spin} 2s ease infinite;
            }
        }
    }

    &:hover:not([disabled]):not(.loading){
        ${mode === 'normal' ? css`
            background-color: ${theme.c.b};
            color: ${theme.c.wh};
        `: ''}
        ${mode === 'dark' ? css`
            background-color: ${theme.c.e};
            color: ${theme.c.b};
        `: ''}
    }
`);

const InputStyle = (theme: ThemeProxy, mode='normal')=>(css`
    border: none;
    outline: none;
    background-color: rgba(0,0,0,0);
    ${mode === 'normal' ? css`
        border-bottom: 2px solid ${theme.c.b};
        color: ${theme.c.b};
    `: ''}
    ${mode === 'dark' ? css`
        border-bottom: 2px solid ${theme.c.b};
        color: ${theme.c.e};
    `: ''}
    font-family: ${theme.fFamily};
    font-size: calc(${theme.fSize});

    &.disabled{
        border-bottom: 2xp solid #404040;
        color: #c0c0c0;
        cursor: not-allowed;
    }
`);

export {
    KeyFrames,
    CardStyle,
    ButtonStyle,
    InputStyle
}