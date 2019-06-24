import * as delay from 'delay';
import * as path from 'path'
import * as fs from 'fs-extra';
import { Guid } from "guid-typescript";
import { ISettings, ICtx } from './interfaces';
class Main {
    private static settings:ISettings;
    private static ctx:ICtx;
    public static async Run(args: string[]) {

      try {
        this.ctx = this.getContext(args);
        console.log(this.ctx);

        this.settings = await this.getSettings();
        console.log(this.settings);

        // console.log("----------------------------------------------------------");

        // console.log(await this.getPathInfo("./"));
        // //await delay.default(1000);

        // console.log(args);

        // await delay.default(1000);
        
        // console.log(await this.getPathInfo(args[0]));
        // console.log(await this.getPathInfo(args[1]));

        // await delay.default(1000);

        

        // console.log(args[0].split("/"));
        // console.log(args[0].split("\\"));
      } 
      catch(err) {
        console.warn(err);
      }
    }
  static getContext(args: string[]): ICtx {

    const node = process.version.substr(1);
    const os = process.platform.indexOf("win")>=0 ? "win" : "linux";
    const arch = process.arch;

    let hostname:string = null;
    let username:string = null;
    let userhomepath:string = null;
    let pathSeparator = "/";

    switch(os) {
      case "linux":
          hostname = process.env.NAME;
          username = process.env.LOGNAME;
          userhomepath = process.env.HOME;
          pathSeparator = "/";
        break;
      case "win":
          hostname = process.env.COMPUTERNAME;
          username = process.env.USERNAME;
          userhomepath = process.env.HOMEPATH;
          pathSeparator = "\\";
        break;
    }

    const path_arr = args[0].split(pathSeparator);
    const appFile = path_arr.pop();
    const appFolder = path_arr.join(pathSeparator);


    return { node, os, arch, appFile, appFolder, args:args.slice(2), hostname, username, userhomepath, pathSeparator };
  }

    private static async getSettings():Promise<ISettings> {
      const configPath = "./settings.json";
      if(!await fs.pathExists(configPath)) {
          // "folder_linux":"/mnt/sdb/sis-silos",
          const s:ISettings = { 
              uid: Guid.create().toString(),
              campo1:"?",
              campo2: 1234,
              campo3: new Date()
          };
          await fs.writeFile(configPath,JSON.stringify(s),'utf8');
      }
      return JSON.parse(await fs.readFile(configPath, 'utf8')); 
  }
  private static async getPathInfo(path:string):Promise<any> {
    const info = await fs.lstat(path);
    return { path, isFile:info.isFile(), isDirectory:info.isDirectory(), isLink:info.isSymbolicLink() }
  }
  private static async getFolders(rootPath:string):Promise<string[]> {
    if (!await fs.pathExists(rootPath)) return [];
    
    let rv:string[] = [];
    const items = await fs.readdir(rootPath);

    for(var i=0;i<items.length;i++){
        const absolutePath = path.join(rootPath,items[i]);
        const info = await fs.lstat(absolutePath);
        if (info.isDirectory()) rv.push(absolutePath);
    };

    return rv;
  }
}
Main.Run(process.argv);