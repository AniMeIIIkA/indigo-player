
import { Module } from '../../Module';
import { IInstance } from '../../types/IInstance';
import './context-menu.scss';
import logo from './indigo-logo-small.png';


export class ContextMenuExtension extends Module {
  public name: string = 'ContextMenuExtension';

  private contextMenu: HTMLDivElement;

  constructor(instance: IInstance) {
    super(instance);

    if (!instance.config.contextMenuItems || instance.config.contextMenuItems.length == 0) {
      return;
    }
    
    instance.container.addEventListener('contextmenu', this.onContextMenu);

    this.contextMenu = document.createElement('div');
    this.contextMenu.classList.add('ig_contextmenu');
    this.contextMenu.style.opacity = '0';
    this.contextMenu.style.display = 'none';
    this.contextMenu.style.pointerEvents = 'none';
    instance.container.appendChild(this.contextMenu);

    for (let item of instance.config.contextMenuItems) {
      this.addItem(
        item.name,
        item.onClick,
      );
    }
  }

  public addItem(html: string, onClick: any) {
    const item = document.createElement('button');
    item.innerHTML = html;
    item.addEventListener('click', onClick);
    this.contextMenu.appendChild(item);
  }

  private onContextMenu = event => {
    event.preventDefault();

    this.contextMenu.style.left = 'initial';
    this.contextMenu.style.right = 'initial';
    this.contextMenu.style.top = 'initial';
    this.contextMenu.style.bottom = 'initial';
    this.contextMenu.style.opacity = '1';
    this.contextMenu.style.display = 'block';
    this.contextMenu.style.pointerEvents = 'auto';

    const rect = this.instance.container.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x + this.contextMenu.offsetWidth >= rect.width) {
      this.contextMenu.style.right = rect.width - x + 'px';
    } else {
      this.contextMenu.style.left = x + 'px';
    }

    if (y + this.contextMenu.offsetHeight >= rect.height) {
      this.contextMenu.style.bottom = rect.height - y + 'px';
    } else {
      this.contextMenu.style.top = y + 'px';
    }

    window.addEventListener('click', this.onClick);
  };

  private onClick = () => {
    this.contextMenu.style.display = 'none';
    this.contextMenu.style.opacity = '0';
    this.contextMenu.style.pointerEvents = 'none';
    window.removeEventListener('click', this.onClick);
  };
}
