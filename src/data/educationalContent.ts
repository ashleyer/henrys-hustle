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
  badgeEmoji: string;
}

export const MBTA_STATIONS: MBTAStation[] = [
  {
    name: 'Park Street Station',
    line: 'GREEN',
    distance: 250,
    description: "America's very first subway station! Opened in 1897 right under Boston Common.",
    landmark: 'Boston Common & Gold State House',
    colorHex: '#15803d',
    badgeEmoji: '🌳',
  },
  {
    name: 'Boylston Street Station',
    line: 'GREEN',
    distance: 500,
    description: 'Home of the historic green streetcars that turn sharp corners underground!',
    landmark: 'Historic Subway Tunnel',
    colorHex: '#15803d',
    badgeEmoji: '🚋',
  },
  {
    name: 'Copley Square (02116)',
    line: 'GREEN',
    distance: 750,
    description: 'The world-famous Boston Marathon Finish Line! Run across the blue and yellow stripe!',
    landmark: 'Marathon Finish Line & Big Library',
    colorHex: '#15803d',
    badgeEmoji: '🏃‍♂️',
  },
  {
    name: 'Fenway & Kenmore',
    line: 'GREEN',
    distance: 1000,
    description: 'Home of the giant Green Monster baseball wall and the famous glowing CITGO sign!',
    landmark: 'Fenway Park Baseball Stadium',
    colorHex: '#15803d',
    badgeEmoji: '⚾',
  },
  {
    name: 'Charles / MGH Bridge',
    line: 'RED',
    distance: 1300,
    description: 'The Red Line train zooms over the water on the Salt-and-Pepper Longfellow Bridge!',
    landmark: 'Charles River & Sailing Boats',
    colorHex: '#dc2626',
    badgeEmoji: '⛵',
  },
  {
    name: 'Harvard Square',
    line: 'RED',
    distance: 1650,
    description: 'Famous brick square filled with books, music, and clever students!',
    landmark: 'Historic Harvard Gates',
    colorHex: '#dc2626',
    badgeEmoji: '🎓',
  },
  {
    name: 'Boston Harbor & Tea Party',
    line: 'BLUE',
    distance: 2000,
    description: 'The big ocean harbor where patriots made giant cups of saltwater tea in 1773!',
    landmark: 'Tea Party Ships & Ocean Harbor',
    colorHex: '#2563eb',
    badgeEmoji: '🌊',
  },
];

export const EDUCATIONAL_TRIVIA: EducationalTrivia[] = [
  {
    id: 'trivia_hub',
    category: 'BOSTON_HISTORY',
    title: 'Why is Boston Called "The Hub"?',
    subtitle: 'Center of the Universe!',
    funFact:
      'A famous Boston writer once joked that Boston is the center of the solar system because so many clever thinkers, inventions, and champions come from here!',
    didYouKnow: 'People all over the world still call Boston "The Hub" today!',
    icon: '🌟',
    distanceTrigger: 200,
  },
  {
    id: 'trivia_first_subway',
    category: 'BOSTON_HISTORY',
    title: "America's Very First Subway!",
    subtitle: 'Built Way Back in 1897',
    funFact:
      'Long before cars and airplanes, Boston was the first city in America to build underground train tracks! People thought riding a train under the street was like magic!',
    didYouKnow: 'The green tracks at Park Street are the exact same tracks from over 100 years ago!',
    icon: '🚇',
    distanceTrigger: 450,
  },
  {
    id: 'trivia_gym_chalk',
    category: 'GYMNASTICS_ACADEMY',
    title: 'Secret Magic Powder: Chalk!',
    subtitle: 'Why Gymnasts Clap White Dust',
    funFact:
      'Gymnasts clap white chalk on their hands before every flip! It eats up sweat and acts like sticky gecko glue so hands do not slip off bars, rings, or vault blocks!',
    didYouKnow: 'Clapping chalk also gets a gymnast super pumped up to do their best routine!',
    icon: '💨',
    distanceTrigger: 650,
  },
  {
    id: 'trivia_back_bay',
    category: 'BOSTON_HISTORY',
    title: 'Back Bay Used to Be a Giant Pond!',
    subtitle: 'A City Built On Water',
    funFact:
      'Did you know Copley Square (02116) was once under ocean water? Thousands of trainloads of gravel were dumped into the bay to build beautiful parks and houses!',
    didYouKnow: 'The buildings stand on tall wooden tree poles deep in the mud!',
    icon: '🦆',
    distanceTrigger: 900,
  },
  {
    id: 'trivia_angular_momentum',
    category: 'GYMNASTICS_ACADEMY',
    title: 'How to Spin Fast: The Super Tuck!',
    subtitle: 'Secret Physics of the Backflip',
    funFact:
      'When you hug your knees super tight to your chest, your body turns into a tiny cannonball and spins 3 times faster! To land safely, you open your arms wide to slow down.',
    didYouKnow: 'Ice skaters and divers use this exact same trick to spin like a turbo fan!',
    icon: '🔄',
    distanceTrigger: 1150,
  },
  {
    id: 'trivia_stick_landing',
    category: 'GYMNASTICS_ACADEMY',
    title: 'How to "Stick the Landing"!',
    subtitle: 'Glued to the Mat!',
    funFact:
      'Sticking the landing means freezing like a statue when your feet hit the ground—no hops! Bend your knees like spring shock absorbers to soak up the landing.',
    didYouKnow: 'Olympic judges jump up and cheer when a gymnast sticks the landing with a big smile!',
    icon: '🎯',
    distanceTrigger: 1450,
  },
  {
    id: 'trivia_tea_party',
    category: 'BOSTON_HISTORY',
    title: 'The Giant Boston Tea Party!',
    subtitle: 'Making Ocean Tea in 1773',
    funFact:
      'Brave Boston patriots dressed up, snuck onto three ships in the harbor, and tossed 342 big chests of tea into the ocean water to stand up for freedom!',
    didYouKnow: 'That was enough tea to make over 18 million giant mugs of tea!',
    icon: '☕',
    distanceTrigger: 1800,
  },
];
