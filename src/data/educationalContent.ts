/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EducationalTrivia } from '../types/game';

export interface MBTAStation {
  name: string;
  line: 'GREEN' | 'RED' | 'ORANGE' | 'BLUE';
  distance: number;
  description: string;
  landmark: string;
  colorHex: string;
}

export const MBTA_STATIONS: MBTAStation[] = [
  {
    name: 'Park Street Station',
    line: 'GREEN',
    distance: 250,
    description: "America's very first subway station, opened on September 1, 1897!",
    landmark: 'Boston Common & State House',
    colorHex: '#15803d',
  },
  {
    name: 'Boylston Station',
    line: 'GREEN',
    distance: 500,
    description: 'Famous for its historic wooden trolleys and sharp rail curves beneath downtown.',
    landmark: 'Historic Tremont Street Subway',
    colorHex: '#15803d',
  },
  {
    name: 'Copley Square Station (02116)',
    line: 'GREEN',
    distance: 750,
    description: 'Heart of the Back Bay and the world-famous Boston Marathon finish line!',
    landmark: 'Boston Public Library & Trinity Church',
    colorHex: '#15803d',
  },
  {
    name: 'Kenmore & Fenway',
    line: 'GREEN',
    distance: 1000,
    description: 'Home of the Boston Red Sox, the Green Monster, and the glowing CITGO sign!',
    landmark: 'Fenway Park',
    colorHex: '#15803d',
  },
  {
    name: 'Charles / MGH',
    line: 'RED',
    distance: 1300,
    description: 'Elevated station crossing the Charles River over the majestic Longfellow "Salt-and-Pepper" Bridge.',
    landmark: 'Charles River Esplanade & Hatch Shell',
    colorHex: '#dc2626',
  },
  {
    name: 'Harvard Square',
    line: 'RED',
    distance: 1650,
    description: 'Historic Cambridge terminus lined with street performers and brick pathways.',
    landmark: 'Harvard Yard',
    colorHex: '#dc2626',
  },
  {
    name: 'Aquarium & Boston Harbor',
    line: 'BLUE',
    distance: 2000,
    description: 'Right on the Atlantic waterfront where the historic Boston Tea Party took place in 1773!',
    landmark: 'Boston Harbor & Tea Party Ships',
    colorHex: '#2563eb',
  },
];

export const EDUCATIONAL_TRIVIA: EducationalTrivia[] = [
  {
    id: 'trivia_hub',
    category: 'BOSTON_HISTORY',
    title: 'Why is Boston called "The Hub"?',
    subtitle: 'The Hub of the Solar System',
    funFact:
      'In 1858, famous Boston writer Oliver Wendell Holmes playfully declared the Massachusetts State House "the hub of the solar system" because Boston was at the center of American ideas, education, and freedom!',
    didYouKnow: 'Local transit, sports teams, and newspapers still proudly call Boston "The Hub" today!',
    icon: '🏛️',
    distanceTrigger: 200,
  },
  {
    id: 'trivia_first_subway',
    category: 'BOSTON_HISTORY',
    title: "America's First Subway Was Born Here!",
    subtitle: 'MBTA Tremont Street Subway (1897)',
    funFact:
      'Before New York or Chicago had subway tunnels, Boston opened the Tremont Street Subway under Boston Common in 1897! Over 100,000 passengers rode electric streetcars underground on the very first day.',
    didYouKnow: 'Park Street and Boylston are still operating on those exact original subway tracks today!',
    icon: '🚇',
    distanceTrigger: 450,
  },
  {
    id: 'trivia_gym_chalk',
    category: 'GYMNASTICS_ACADEMY',
    title: 'The Secret Science of Gymnastics Chalk',
    subtitle: 'Magnesium Carbonate Magic',
    funFact:
      'Gymnasts dust their hands and feet with pure magnesium carbonate powder. It instantly absorbs sweat and moisture, dramatically increasing friction so hands never slip off bars, rings, or vault blocks!',
    didYouKnow: 'The white puff you see when gymnasts clap their hands is chalk micro-particles settling into skin ridges!',
    icon: '💨',
    distanceTrigger: 650,
  },
  {
    id: 'trivia_back_bay',
    category: 'BOSTON_HISTORY',
    title: 'Back Bay Used to Be Underwater!',
    subtitle: 'The Great Boston Landfill of the 1850s',
    funFact:
      'The entire neighborhood of Back Bay (including zip code 02116!) was originally a soggy saltwater tidal bay. Between 1857 and 1882, millions of trainloads of gravel from Needham filled it in to build Victorian brownstones!',
    didYouKnow: 'The buildings in Back Bay rest on thousands of submerged wooden pilings beneath the street.',
    icon: '🦆',
    distanceTrigger: 900,
  },
  {
    id: 'trivia_angular_momentum',
    category: 'GYMNASTICS_ACADEMY',
    title: 'Physics of the Backflip: Angular Momentum',
    subtitle: 'Why Gymnasts Tuck Their Knees',
    funFact:
      'When a gymnast pulls their knees tight to their chest into a "tuck", they reduce their rotational inertia. By the laws of physics, this makes their body spin up to 3 times faster in mid-air than if they stayed stretched out!',
    didYouKnow: 'To slow down for a clean landing, the gymnast simply opens up ("kicks out") their body to brake the spin!',
    icon: '🔄',
    distanceTrigger: 1150,
  },
  {
    id: 'trivia_stick_landing',
    category: 'GYMNASTICS_ACADEMY',
    title: 'Sticking the Landing Like an Olympian',
    subtitle: 'Biomechanics of Zero-Hop Landings',
    funFact:
      'A "stuck landing" means your feet hit the mat and freeze completely with zero hops or stumbles. Gymnasts bend their knees to 120 degrees and chest slightly forward, turning their legs into shock absorbers that soak up forces up to 10 times their body weight!',
    didYouKnow: 'At the Olympic Games, a single tiny hop on landing can deduct 0.1 to 0.3 points from your execution score.',
    icon: '🎯',
    distanceTrigger: 1450,
  },
  {
    id: 'trivia_tea_party',
    category: 'BOSTON_HISTORY',
    title: 'The Boston Tea Party (1773)',
    subtitle: '342 Chests Into the Harbor',
    funFact:
      'On a chilly December night in 1773, the Sons of Liberty boarded three merchant ships at Griffin’s Wharf in Boston Harbor and tossed 342 chests of British tea into the water to protest taxation without representation.',
    didYouKnow: 'That tea weighed over 92,000 pounds—enough to brew 18.5 million cups of tea!',
    icon: '⛵',
    distanceTrigger: 1800,
  },
];
