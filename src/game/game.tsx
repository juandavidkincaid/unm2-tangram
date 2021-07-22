import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import clsx from 'clsx';
import { EventEmitter } from 'events';


import {
    NC,
    Title
} from '@tangram-util';
import { theme, app } from '@tangram-core';


const TangramGameViewLayout = styled.div`

`;

const TangramGameView = NC('TangramGameView', ({ children }) => {
    return <TangramGameViewLayout>

    </TangramGameViewLayout>;
});

export {
    TangramGameView
}
