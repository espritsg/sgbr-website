import * as migration_20261122_203157_initial from './20261122_203157_initial';
import * as migration_20261123_091437_design_ueberarbeitung from './20261123_091437_design_ueberarbeitung';
import * as migration_20261123_151139_bewerbung_fuer from './20261123_151139_bewerbung_fuer';
import * as migration_20261125_100852_newsletter_ohne_abonnenten from './20261125_100852_newsletter_ohne_abonnenten';
import * as migration_20261125_100900_resend_broadcasts from './20261125_100900_resend_broadcasts';

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
    name: '20261123_151139_bewerbung_fuer',
  },
  {
    up: migration_20261125_100852_newsletter_ohne_abonnenten.up,
    down: migration_20261125_100852_newsletter_ohne_abonnenten.down,
    name: '20261125_100852_newsletter_ohne_abonnenten',
  },
  {
    up: migration_20261125_100900_resend_broadcasts.up,
    down: migration_20261125_100900_resend_broadcasts.down,
    name: '20261125_100900_resend_broadcasts'
  },
];
