const AXIS_THRESHOLD = 0.35;

type MappedKey = {
  key: string;
  code: string;
  keyCode: number;
};

const LEFT = { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37 };
const RIGHT = { key: "ArrowRight", code: "ArrowRight", keyCode: 39 };
const JUMP = { key: "ArrowUp", code: "ArrowUp", keyCode: 38 };
const FIRE = { key: " ", code: "Space", keyCode: 32 };
const PAUSE = { key: "Escape", code: "Escape", keyCode: 27 };

export class GamepadKeyboardBridge {
  private animationFrame = 0;
  private readonly activeCodes = new Set<string>();
  private focused = document.hasFocus();

  public start(): void {
    window.addEventListener("blur", this.handleBlur);
    window.addEventListener("focus", this.handleFocus);
    this.animationFrame = requestAnimationFrame(this.poll);
  }

  private readonly poll = (): void => {
    if (!this.focused) {
      this.animationFrame = requestAnimationFrame(this.poll);
      return;
    }

    const gamepad = navigator.getGamepads?.().find((pad) => pad !== null);
    const horizontal = gamepad?.axes[0] ?? 0;

    this.updateKey(LEFT, !!gamepad && (horizontal < -AXIS_THRESHOLD || !!gamepad.buttons[14]?.pressed));
    this.updateKey(RIGHT, !!gamepad && (horizontal > AXIS_THRESHOLD || !!gamepad.buttons[15]?.pressed));
    this.updateKey(JUMP, !!gamepad && (!!gamepad.buttons[0]?.pressed || !!gamepad.buttons[12]?.pressed));
    this.updateKey(FIRE, !!gamepad && !!gamepad.buttons[2]?.pressed);
    this.updateKey(PAUSE, !!gamepad && !!gamepad.buttons[9]?.pressed);

    this.animationFrame = requestAnimationFrame(this.poll);
  };

  private updateKey(mappedKey: MappedKey, pressed: boolean): void {
    if (pressed === this.activeCodes.has(mappedKey.code)) return;

    if (pressed) {
      this.activeCodes.add(mappedKey.code);
    } else {
      this.activeCodes.delete(mappedKey.code);
    }

    const event = new KeyboardEvent(pressed ? "keydown" : "keyup", {
      key: mappedKey.key,
      code: mappedKey.code,
      bubbles: true
    });
    Object.defineProperty(event, "keyCode", { value: mappedKey.keyCode });
    Object.defineProperty(event, "which", { value: mappedKey.keyCode });
    window.dispatchEvent(event);
  }

  private readonly handleBlur = (): void => {
    this.focused = false;
    for (const code of [...this.activeCodes]) {
      const mappedKey = [LEFT, RIGHT, JUMP, FIRE, PAUSE].find((key) => key.code === code);
      if (mappedKey) this.updateKey(mappedKey, false);
    }
  };

  private readonly handleFocus = (): void => {
    this.focused = true;
  };
}
