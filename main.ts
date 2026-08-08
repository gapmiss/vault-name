import { App, Plugin, getIconIds, setIcon, PluginSettingTab, Setting, IconName, SuggestModal, type SettingDefinitionItem } from "obsidian";

interface VaultNamePluginSettings {
  sticky: boolean;
  alignment: string;
  padding: string;
  background: string;
  border: string;
  borderRadius: string;
  showIcon: boolean;
  icon: string;
  iconSize: string;
  iconColor: string;
  iconRotate: string;
  titleFontSize: string;
  titleColor: string;
  titleFont: string;
  titleLetterSpacing: string;
  titleWeight: string;
}

const DEFAULT_SETTINGS: VaultNamePluginSettings = {
  sticky: false,
  alignment: 'flex-start',
  padding: 'var(--size-2-2)',
  background: 'var(--background-secondary)',
  border: 'none',
  borderRadius: 'var(--radius-m)',
  showIcon: false,
  icon: 'vault',
  iconSize: 'var(--icon-m)',
  iconColor: 'var(--nav-item-color)',
  iconRotate: '0deg',
  titleFontSize: "var(--font-ui-medium)",
  titleColor: "var(--nav-item-color)",
  titleFont: "var(--font-interface)",
  titleLetterSpacing: "normal",
  titleWeight: "var(--font-normal)",
}

export default class VaultNamePlugin extends Plugin {
  settings!: VaultNamePluginSettings;

  async onload() {
    // settings tab
    await this.loadSettings();
    this.addSettingTab(new VaultNameSettingTab(this.app, this));
    this.app.workspace.onLayoutReady(() => this.onLayoutReady());
    // update on file/folder create
    this.registerEvent(
      this.app.vault.on('create', () => {
        this.deactivateVaultName();
        this.activateVaultName();
      })
    );
    // update on file/folder delete
    this.registerEvent(
      this.app.vault.on('delete', () => {
        this.deactivateVaultName();
        this.activateVaultName();
      })
    );
  }

  onLayoutReady() {
    this.deactivateVaultName();
    this.activateVaultName();
  }

  onunload() {
    this.deactivateVaultName();
  }

  activateVaultName() {
    const mainDoc = this.app.workspace.containerEl.ownerDocument;
    const navContainer = mainDoc.querySelector('.nav-files-container');
    // wrapper
    const vaultNameWrapper = createDiv('nav-vault-name', (el) => {
      // wrapper styles
      let wrapperStyles: string = '';
      // alignment
      if (this.settings.alignment !== '') {
        wrapperStyles += '--vault-name-alignment: ' + this.settings.alignment + '; ';
      } else {
        wrapperStyles += '--vault-name-alignment: ' + DEFAULT_SETTINGS.alignment + '; ';
      }
      // padding
      if (this.settings.padding !== '') {
        wrapperStyles += ' --vault-name-padding: ' + this.settings.padding + '; '
      } else {
        wrapperStyles += ' --vault-name-padding: ' + DEFAULT_SETTINGS.padding + '; ';
      }
      // position: sticky
      if (this.settings.sticky) {
        el.addClass('is-sticky');
        wrapperStyles += '--vault-name-position: sticky; --vault-name-top: 0px; --vault-name-z-index: 9; ';
      } else {
        wrapperStyles += '--vault-name-position: relative; --vault-name-top: auto; --vault-name-z-index: inherit; ';
      }
      // border
      if (this.settings.border !== '') {
        wrapperStyles += '--vault-name-border: ' + this.settings.border + '; ';
      } else {
        wrapperStyles += '--vault-name-border: ' + DEFAULT_SETTINGS.border + '; ';
      }
      // border-radius
      if (this.settings.borderRadius !== '') {
        wrapperStyles += '--vault-name-border-radius: ' + this.settings.borderRadius + '; ';
      } else {
        wrapperStyles += '--vault-name-border-radius: ' + DEFAULT_SETTINGS.borderRadius + '; ';
      }
      // background-color
      if (this.settings.background !== '') {
        wrapperStyles += '--vault-name-bgcolor: ' + this.settings.background + '; ';
      } else {
        wrapperStyles += '--vault-name-bgcolor: ' + DEFAULT_SETTINGS.background + '; ';
      }
      // set CSS variables on element
      el.setAttribute(
        'style',
        wrapperStyles
      );
    });
    // icon styles
    if (this.settings.showIcon) {
      const vaultNameIcon = createDiv('nav-vault-name-icon', (el) => {
        let iconStyles:string = '';
        // icon size
        if (this.settings.iconSize !== '') {
          iconStyles += '--vault-name-icon-size: ' + this.settings.iconSize + '; ';
        } else {
          iconStyles += '--vault-name-icon-size: ' + DEFAULT_SETTINGS.iconSize + '; '
        }
        // icon color
        if (this.settings.iconColor !== '') {
          iconStyles += '--vault-name-icon-color: ' + this.settings.iconColor + '; ';
        } else {
          iconStyles += '--vault-name-icon-color: ' + DEFAULT_SETTINGS.iconColor + '; '
        }
        // icon transform: rotate
        if (this.settings.iconRotate !== '') {
          iconStyles += '--vault-name-icon-transform: ' + this.settings.iconRotate + '; ';
        } else {
          iconStyles += '--vault-name-icon-transform: ' + DEFAULT_SETTINGS.iconRotate + '; '
        }
        // set CSS variables on element
        el.setAttribute(
          'style',
          iconStyles
        );
        // append icon to element
        setIcon(el, this.settings.icon);
      });
      // append icon element to wrapper div
      vaultNameWrapper.appendChild(vaultNameIcon);
    }
    // title styles
    const vaultNameElement = createDiv('nav-vault-name-title', (el) => {
      // vault name
      el.textContent = this.app.vault.getName();
      let titleStyles: string = '';
      // title color
      if (this.settings.titleColor !== '') {
        titleStyles += '--vault-name-title-color: ' + this.settings.titleColor + '; ';
      } else {
        titleStyles += '--vault-name-title-color: ' + DEFAULT_SETTINGS.titleColor + '; ';
      }
      // title font-family
      if (this.settings.titleFont !== '') {
        titleStyles += '--vault-name-title-font: ' + this.settings.titleFont + '; ';
      } else {
        titleStyles += '--vault-name-title-font: ' + DEFAULT_SETTINGS.titleFont + '; ';
      }
      // title font-size
      if (this.settings.titleFontSize !== '') {
        titleStyles += '--vault-name-title-size: ' + this.settings.titleFontSize + '; ';
      } else {
        titleStyles += '--vault-name-title-size: ' + DEFAULT_SETTINGS.titleFontSize + '; ';
      }
      // title letter-spacing
      if (this.settings.titleLetterSpacing !== '') {
        titleStyles += '--vault-name-title-letter-spacing: ' + this.settings.titleLetterSpacing + '; ';
      } else {
        titleStyles += '--vault-name-title-letter-spacing: ' + DEFAULT_SETTINGS.titleLetterSpacing + '; ';
      }
      // title font-weight
      if (this.settings.titleWeight !== '') {
        titleStyles += '--vault-name-title-weight: ' + this.settings.titleWeight + '; ';
      } else {
        titleStyles += '--vault-name-title-weight: ' + DEFAULT_SETTINGS.titleWeight + '; ';
      }
      // set CSS variables on element
      el.setAttribute(
        'style',
        titleStyles
      );
    });
    // append title element
    vaultNameWrapper.appendChild(vaultNameElement);
    // prepend into navigation containter
    navContainer?.prepend(vaultNameWrapper);
  }

  deactivateVaultName() {
    const mainDoc = this.app.workspace.containerEl.ownerDocument;
    mainDoc.querySelector('.nav-vault-name')?.remove();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<VaultNamePluginSettings>);
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.deactivateVaultName();
    this.activateVaultName();
  }

}

class VaultNameSettingTab extends PluginSettingTab {
  plugin: VaultNamePlugin;

  constructor(app: App, plugin: VaultNamePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        type: 'group',
        heading: 'Wrapper styles',
        items: [
          {
            name: 'Sticky',
            desc: 'Pin the vault name to the top of the file explorer. Default: disabled',
            render: (setting: Setting) => {
              setting.addToggle((toggle) => {
                toggle
                  .setValue(this.plugin.settings.sticky)
                  .onChange(async (value) => {
                    this.plugin.settings.sticky = value;
                    await this.plugin.saveSettings();
                  });
              });
            },
          },
          {
            name: 'Alignment',
            desc: 'CSS justify-content value. Default: flex-start',
            render: (setting: Setting) => {
              setting.addDropdown((dropdown) => {
                dropdown
                  .addOptions({
                    'flex-start': 'flex-start',
                    'center': 'center',
                    'flex-end': 'flex-end',
                  })
                  .setValue(this.plugin.settings.alignment !== '' ? this.plugin.settings.alignment : 'flex-start')
                  .onChange(async (value) => {
                    this.plugin.settings.alignment = value;
                    await this.plugin.saveSettings();
                  });
              });
            },
          },
          {
            name: 'Padding',
            desc: this.linkDesc(
              'CSS padding value. For available variables, see ',
              'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Spacing',
              'Spacing',
              '. Default: var(--size-2-2)'
            ),
            render: (setting: Setting) => {
              setting.addText((text) =>
                text
                  .setPlaceholder('var(--size-2-2)')
                  .setValue(this.plugin.settings.padding)
                  .onChange(async (value) => {
                    this.plugin.settings.padding = value;
                    await this.plugin.saveSettings();
                  })
              );
            },
          },
          {
            name: 'Background color',
            desc: this.linkDesc(
              'CSS background-color value. For available variables, see ',
              'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Colors',
              'Colors',
              '. Default: var(--background-secondary)'
            ),
            render: (setting: Setting) => {
              setting.addText((text) =>
                text
                  .setPlaceholder('var(--background-secondary)')
                  .setValue(this.plugin.settings.background)
                  .onChange(async (value) => {
                    this.plugin.settings.background = value;
                    await this.plugin.saveSettings();
                  })
              );
            },
          },
          {
            name: 'Border',
            desc: this.linkDesc(
              'CSS border value. For help with border, see ',
              'https://developer.mozilla.org/en-US/docs/Web/CSS/border',
              'MDN: border',
              '. Default: none'
            ),
            render: (setting: Setting) => {
              setting.addText((text) =>
                text
                  .setPlaceholder('none')
                  .setValue(this.plugin.settings.border)
                  .onChange(async (value) => {
                    this.plugin.settings.border = value;
                    await this.plugin.saveSettings();
                  })
              );
            },
          },
          {
            name: 'Border radius',
            desc: this.linkDesc(
              'CSS border-radius value. For available variables, see ',
              'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Radiuses',
              'Radiuses',
              '. Default: var(--radius-m)'
            ),
            render: (setting: Setting) => {
              setting.addText((text) =>
                text
                  .setPlaceholder('var(--radius-m)')
                  .setValue(this.plugin.settings.borderRadius)
                  .onChange(async (value) => {
                    this.plugin.settings.borderRadius = value;
                    await this.plugin.saveSettings();
                  })
              );
            },
          },
        ],
      },
      {
        type: 'group',
        heading: 'Icon styles',
        items: [
          {
            name: 'Show icon',
            desc: 'Default: disabled',
            render: (setting: Setting) => {
              setting.addToggle((toggle) => {
                toggle
                  .setValue(this.plugin.settings.showIcon)
                  .onChange(async (value) => {
                    this.plugin.settings.showIcon = value;
                    await this.plugin.saveSettings();
                  });
              });
            },
          },
          {
            name: 'Icon',
            desc: 'To select an icon, click the button. Default: vault',
            render: (setting: Setting) => {
              setting.addButton((cb) => {
                cb.setIcon(this.plugin.settings.icon)
                  .setTooltip('Select icon')
                  .onClick(async (e) => {
                    e.preventDefault();
                    const modal = new IconSuggestModal(this.plugin);
                    modal.open();
                  });
                cb.buttonEl.setAttribute('data-note-toolbar-no-icon', !this.plugin.settings.icon ? 'true' : 'false');
                cb.buttonEl.setAttribute('tabindex', '0');
                this.plugin.registerDomEvent(
                  cb.buttonEl, 'keydown', (e) => {
                    switch (e.key) {
                      case 'Enter':
                      case ' ': {
                        e.preventDefault();
                        const modal = new IconSuggestModal(this.plugin);
                        modal.open();
                        break;
                      }
                    }
                  });
              });
            },
          },
          {
            name: 'Icon size',
            desc: this.linkDesc(
              'CSS width/height value. For available variables, see ',
              'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Icons#Icon+sizes',
              'Icon sizes',
              '. Default: var(--icon-m)'
            ),
            render: (setting: Setting) => {
              setting.addText((text) =>
                text
                  .setPlaceholder('var(--icon-m)')
                  .setValue(this.plugin.settings.iconSize)
                  .onChange(async (value) => {
                    this.plugin.settings.iconSize = value;
                    await this.plugin.saveSettings();
                  })
              );
            },
          },
          {
            name: 'Icon color',
            desc: this.dualLinkDesc(
              'CSS color value. For available variables, see ',
              'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Colors',
              'Colors',
              'https://docs.obsidian.md/Reference/CSS+variables/Components/Navigation#CSS+variables',
              'Navigation',
              '. Default: var(--nav-item-color)'
            ),
            render: (setting: Setting) => {
              setting.addText((text) =>
                text
                  .setPlaceholder('var(--nav-item-color)')
                  .setValue(this.plugin.settings.iconColor)
                  .onChange(async (value) => {
                    this.plugin.settings.iconColor = value;
                    await this.plugin.saveSettings();
                  })
              );
            },
          },
          {
            name: 'Rotate',
            desc: this.linkDesc(
              'CSS transform: rotate() value. For help with rotate, see ',
              'https://developer.mozilla.org/en-US/docs/Web/CSS/rotate',
              'MDN: rotate',
              '. Default: 0deg'
            ),
            render: (setting: Setting) => {
              setting.addText((text) =>
                text
                  .setPlaceholder('0deg')
                  .setValue(this.plugin.settings.iconRotate)
                  .onChange(async (value) => {
                    this.plugin.settings.iconRotate = value;
                    await this.plugin.saveSettings();
                  })
              );
            },
          },
        ],
      },
      {
        type: 'group',
        heading: 'Title styles',
        items: [
          {
            name: 'Color',
            desc: this.dualLinkDesc(
              'CSS color value. For available variables, see ',
              'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Colors',
              'Colors',
              'https://docs.obsidian.md/Reference/CSS+variables/Components/Navigation#CSS+variables',
              'Navigation',
              '. Default: var(--nav-item-color)'
            ),
            render: (setting: Setting) => {
              setting.addText((text) =>
                text
                  .setPlaceholder('var(--nav-item-color)')
                  .setValue(this.plugin.settings.titleColor)
                  .onChange(async (value) => {
                    this.plugin.settings.titleColor = value;
                    await this.plugin.saveSettings();
                  })
              );
            },
          },
          {
            name: 'Font',
            desc: this.linkDesc(
              'CSS font-family value. For available variables, see ',
              'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Typography#Fonts',
              'Typography',
              '. Default: var(--font-interface)'
            ),
            render: (setting: Setting) => {
              setting.addText((text) =>
                text
                  .setPlaceholder('var(--font-interface)')
                  .setValue(this.plugin.settings.titleFont)
                  .onChange(async (value) => {
                    this.plugin.settings.titleFont = value;
                    await this.plugin.saveSettings();
                  })
              );
            },
          },
          {
            name: 'Font size',
            desc: this.linkDesc(
              'CSS font-size value. For available variables, see ',
              'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Typography#Font+size',
              'Typography',
              '. Default: var(--font-ui-medium)'
            ),
            render: (setting: Setting) => {
              setting.addText((text) =>
                text
                  .setPlaceholder('var(--font-ui-medium)')
                  .setValue(this.plugin.settings.titleFontSize)
                  .onChange(async (value) => {
                    this.plugin.settings.titleFontSize = value;
                    await this.plugin.saveSettings();
                  })
              );
            },
          },
          {
            name: 'Font weight',
            desc: this.linkDesc(
              'CSS font-weight value. For available variables, see ',
              'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Typography#Font+weight',
              'Typography',
              '. Default: var(--font-normal)'
            ),
            render: (setting: Setting) => {
              setting.addText((text) =>
                text
                  .setPlaceholder('var(--font-normal)')
                  .setValue(this.plugin.settings.titleWeight)
                  .onChange(async (value) => {
                    this.plugin.settings.titleWeight = value;
                    await this.plugin.saveSettings();
                  })
              );
            },
          },
          {
            name: 'Letter spacing',
            desc: this.linkDesc(
              'CSS letter-spacing value. For help with letter-spacing, see ',
              'https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing',
              'MDN: letter-spacing',
              '. Default: normal'
            ),
            render: (setting: Setting) => {
              setting.addText((text) =>
                text
                  .setPlaceholder('normal')
                  .setValue(this.plugin.settings.titleLetterSpacing)
                  .onChange(async (value) => {
                    this.plugin.settings.titleLetterSpacing = value;
                    await this.plugin.saveSettings();
                  })
              );
            },
          },
        ],
      },
    ];
  }

  private linkDesc(before: string, href: string, text: string, after: string): DocumentFragment {
    const frag = createFragment();
    frag.append(
      before,
      frag.createEl('a', {
        href,
        text,
        attr: { 'aria-label': href, 'data-tooltip-position': 'top', 'tabindex': '0' },
      }),
      after
    );
    return frag;
  }

  private dualLinkDesc(before: string, href1: string, text1: string, href2: string, text2: string, after: string): DocumentFragment {
    const frag = createFragment();
    frag.append(
      before,
      frag.createEl('a', {
        href: href1,
        text: text1,
        attr: { 'aria-label': href1, 'data-tooltip-position': 'top', 'tabindex': '0' },
      }),
      ' and ',
      frag.createEl('a', {
        href: href2,
        text: text2,
        attr: { 'aria-label': href2, 'data-tooltip-position': 'top', 'tabindex': '0' },
      }),
      after
    );
    return frag;
  }
}

/**
 * credit: https://github.com/chrisgurney/obsidian-note-toolbar/tree/master/src/Settings/IconSuggestModal.ts
 */
class IconSuggestModal extends SuggestModal<IconName> {
  public plugin: VaultNamePlugin;

  constructor(plugin: VaultNamePlugin) {
    super(plugin.app);
    this.modalEl.addClass("vault-name-icon-select-modal");
    this.plugin = plugin;
    this.setPlaceholder("Search for an icon");
    this.setInstructions([
      {command: '↑↓', purpose: 'to navigate'},
      {command: '↵', purpose: 'to use'},
      {command: 'esc', purpose: 'to dismiss'},
    ]);
  }

  getSuggestions(inputStr: string): IconName[] {
      const iconIds = getIconIds();
      const iconSuggestions: IconName[] = [];
      const lowerCaseInputStr = inputStr.toLowerCase();
      iconSuggestions.push("No icon");
      iconIds.forEach((icon: IconName) => {
          if (icon.toLowerCase().contains(lowerCaseInputStr)) {
              iconSuggestions.push(icon);
          }
      });
      return iconSuggestions;
  }

  renderSuggestion(icon: IconName, el: HTMLElement): void {
      el.addClass("vault-name-icon-suggestion");
      let iconName = el.createSpan();
      if (icon === "No icon") {
          iconName.setText(icon);
      }
      else {
          iconName.setText(icon.startsWith("lucide-") ? icon.substring(7) : icon);
          let iconGlyph = el.createSpan();
          setIcon(iconGlyph, icon);
      }
  }

  /**
   * Saves the selected icon to settings, closes the modal, refreshes the parent.
   * @param selectedIcon Icon to save.
   */
  onChooseSuggestion(item: string, _evt: MouseEvent | KeyboardEvent) {
      this.plugin.settings.icon = item;
      void this.plugin.saveSettings();
      setIcon(activeDocument.querySelector('[data-note-toolbar-no-icon]')!, item);
      this.close();
  }

}