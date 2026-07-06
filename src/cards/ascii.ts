/**
 * ASCII art library.
 *
 * 10 detailed arts (exactly 8 lines high, no text) selectable by index. Shared
 * by any card that wants a left-hand art column (terminal, neofetch).
 */

export const ASCII_ARTS: Record<number, string[]> = {
  // 1: Octocat silhouette
  1: [
    "      .---.       .---.      ",
    "     (     \\     /     )     ",
    "      \\     \\   /     /      ",
    "   .---'             '---.   ",
    "  /  o             o  \\  ",
    "  |    __           __    |  ",
    "  \\   (  )  .---.  (  )   /  ",
    "   '---'  (  o o  )  '---'   ",
  ],
  // 2: Mascot (dude \ (^_^) /)
  2: [
    "        \\  (^_^)  /          ",
    "         \\   |   /           ",
    "          \\  |  /            ",
    "           '-|-'             ",
    "             |               ",
    "            / \\              ",
    "           /   \\             ",
    "          /     \\            ",
  ],
  // 3: Git branch graph
  3: [
    "  *---*---*---*---*  [main]  ",
    "       \\                     ",
    "        *---*---*   [dev]    ",
    "             \\               ",
    "              *---*  [feat]  ",
    "             /               ",
    "        *---*                ",
    "       /                     ",
  ],
  // 4: Coffee cup
  4: [
    "       (  )   (  )           ",
    "        )  (   )  (          ",
    "      .-------------.        ",
    "      |             |---.    ",
    "      |   COFFEE    |   |    ",
    "      |             |---'    ",
    "      \\             /        ",
    "       `-----------'         ",
  ],
  // 5: Terminal window
  5: [
    "   ._____________________.   ",
    "   |  bash               |   ",
    "   |=====================|   ",
    "   | $ npm run build     |   ",
    "   | ✓ Compiled.         |   ",
    "   | _                   |   ",
    "   |_____________________|   ",
    "                             ",
  ],
  // 6: Database
  6: [
    "    ._________________.      ",
    "    | [o] [=======]   |      ",
    "    | [o] [=======]   |      ",
    "    |~~~~~~~~~~~~~~~~~|      ",
    "    | [o] [=======]   |      ",
    "    | [o] [=======]   |      ",
    "    |~~~~~~~~~~~~~~~~~|      ",
    "    | [o] [=======]   |      ",
  ],
  // 7: Keyboard block
  7: [
    "   .________________________.",
    "   | [`][1][2][3][4][5][6]  |",
    "   | [Tab][Q][W][E][R][T]   |",
    "   | [Caps][A][S][D][F][G]  |",
    "   | [Shift][Z][X][C][V]    |",
    "   | [Ctrl][Alt][ Space ]   |",
    "   |________________________|",
    "                             ",
  ],
  // 8: Cloud
  8: [
    "            .------.         ",
    "         .-(        )-.      ",
    "        (              )     ",
    "       (   CLOUD INFRA  )    ",
    "        (              )     ",
    "         `------------'      ",
    "          / /  / /  / /      ",
    "                             ",
  ],
  // 9: Star
  9: [
    "             /\\              ",
    "            /  \\             ",
    "      /\\___/    \\___/\\       ",
    "      \\              /       ",
    "       \\   STARDOM  /        ",
    "       /            \\        ",
    "      \\/   \\    /   \\/       ",
    "            \\  /             ",
  ],
  // 10: Code brackets
  10: [
    "         .________.          ",
    "        /  ______  \\         ",
    "       /  /      \\  \\        ",
    "      |  /  </>   \\  |       ",
    "      |  |  CODE  |  |       ",
    "      |  \\        /  |       ",
    "       \\  \\______/  /        ",
    "        \\__________/         ",
  ],
};

/** Resolve an ascii art by 1-based index, defaulting to Octocat (1). */
export function resolveAscii(index: number | undefined): string[] {
  return ASCII_ARTS[index ?? 1] ?? ASCII_ARTS[1];
}
