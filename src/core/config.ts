import { Theme } from '@tangram-styling';

import 'moment';
import {Decimal} from 'decimal.js';
import toformat from 'toformat';

toformat(Decimal);

Decimal.format = {
    decimalSeparator: ',',
    groupSeparator: '.',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: '',
    fractionGroupSize : 0
};

const theme = Theme.createTheme({
    colors: {
        a: '#692B0F',
        b: '#6B4431',
        c: '#B84D1A',
        d: '#E86020',
        e: '#FF9D70'
    },
    fontSize: '1em',
    fontFamily: "'Zen Tokyo Zoo', cursive"
}, 'function');

const AppTheme: InstanceType<typeof Theme> = Theme.accessTheme(theme);

export {
    theme,
    AppTheme
}