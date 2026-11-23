import * as migration_20261122_203157_initial from './20261122_203157_initial';
import * as migration_20261123_091437_design_ueberarbeitung from './20261123_091437_design_ueberarbeitung';
import * as migration_20261123_151139_bewerbung_fuer from './20261123_151139_bewerbung_fuer';

export const migrations = [
  {
    up: migration_20261122_203157_initial.up,
    down: migration_20261122_203157_initial.down,
    name: '20261122_203157_initial',
  },
  {
    up: migration_20261123_091437_design_ueberarbeitung.up,
    down: migration_20261123_091437_design_ueberarbeitung.down,
    name: '20261123_091437_design_ueberarbeitung',
  },
  {
    up: migration_20261123_151139_bewerbung_fuer.up,
    down: migration_20261123_151139_bewerbung_fuer.down,
    name: '20261123_151139_bewerbung_fuer'
  },
];
