import { useReducer, useEffect } from 'react';
import lodash from 'lodash';
import { EventEmitter } from 'events';
import type {DeepPartial} from 'ts-essentials';


import {bindAllMethods} from '@tangram-util';

declare global {
    interface Window {
        adat?: string;
    }
}

type AppData = Record<any, any>;

const App = new class App {
    data: AppData;
    events: EventEmitter;

    constructor() {
        bindAllMethods(this);
        this.data = {} as AppData;
        this.events = new EventEmitter().setMaxListeners(0);

        this.addHashHandler();
    }


    addHashHandler(){
        window.addEventListener('keydown', (event)=>{
            if(event.altKey && event.ctrlKey && event.key.toLocaleLowerCase() === 'h'){
                alert(`
                    BDH-${this.data.backendHash}
                    FDH-${__webpack_hash__}
                `);
            }
        });
    }

    updateData(data: DeepPartial<AppData>) {
        lodash.merge(this.data, data);
        this.events.emit('data.update');
    }

    useAppData() {
        const forceUpdate = useReducer((s) => !s, false)[1];
        useEffect(() => {
            this.events.on('data.update', forceUpdate);
            return () => {
                this.events.off('data.update', forceUpdate);
            }
        });
        return { ...this.data };
    }
}

export {
    App,
    App as app
}
