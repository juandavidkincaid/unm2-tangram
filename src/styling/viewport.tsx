import React, {useEffect, useState, forwardRef, ComponentType} from 'react';
import { NC } from '@tangram-util';

type ViewPortRule = null | string | [number | null, number | null];

const ViewPortTests = new Map<string, ViewPortRule>([
    ['Mobile', [0, 425]],
    ['MobileSmall', [0, 320]],
    ['MobileMedium', [320, 375]],
    ['MobileLarge', [375, 425]],

    ['MobileExtended', [0, 525]],

    ['Tablet', [425, 768]],
    ['MobileTablet', [0, 768]],

    ['Window', [768, null]],
    ['Computer', [768, 2560]],
    ['Laptop', [768, 1440]],
    ['LaptopSmall', [768, 1024]],
    ['LaptopLarge', [1024, 1440]],
    ['DesktopSmall', [1440, 1920]],
    ['DesktopLarge', [1920, 2560]],

    ['4K', [2560, null]],

    ['Fallback', [null, null]]
].map(([k, v])=>([k, v] as [string, ViewPortRule])));


const useViewport = () => {
    const [viewPort, setViewPort] = useState(window.screen.width);
    useEffect(()=>{
        const onResize = ()=>{
            setViewPort(window.screen.width);
        };
        window.addEventListener('resize', onResize);
        return ()=>{
            window.removeEventListener('resize', onResize);
        }
    }, []);
    return viewPort;
};

const viewportSwitch = (rules: [ViewPortRule, any][]) => {
    return ()=>{
        const viewPort = window.screen.width;
        for(let [rule, value] of rules){
            if(typeof rule === 'string'){
                rule = ViewPortTests.get(rule) ?? [null, null];
            }

            if(rule === null){
                rule = [null, null];
            }
        
            let test = true;
            test = test && (rule[0] === null || rule[0] < viewPort);
            test = test && (rule[1] === null || rule[1] >= viewPort);
            if(test){
                return value;
            }
        }
        return null;
    }
};

const ViewportStyle = (rule: ViewPortRule)=>{
    if(typeof rule === 'string'){
        rule = ViewPortTests.get(rule) ?? [null, null];
    }

    if(rule === null){
        rule = [null, null];
    }

    return `@media ${[
        `screen`,
        rule[0] !== null && `(min-width: ${rule[0]}px)`,
        rule[1] !== null  && `(max-width: ${rule[1]}px)`,
    ].filter(i=>!!i).join(' and ')}`
}

export {
    ViewPortRule,
    useViewport,
    viewportSwitch,
    ViewportStyle
}