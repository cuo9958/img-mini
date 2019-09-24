import React, { Fragment } from 'react';
import Upload from 'rc-upload'
// import request from './utils/request'
import AV from 'leancloud-storage';
import Finger from "fingerprintjs2";
import Empty from '../plugin/empty';
import Progress from "../plugin/progress";
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const ImgTask = AV.Object.extend('ImgTask');


function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

export default class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            caches: [],
            index: 0,
            imgSrc: '',
            imgData: {
                width: 100,
                height: 100
            }
        }
    }

    render() {

        return <div>
            <div className="top_box">
                <img className="bg" src="http://resource.guofangchao.com/top_l_bg.jpg" alt="" />
                {this.state.index === 0 && <Upload type="drag" className="upload_box"
                    accept={"image/*"}
                    multiple={true}
                    action="/api/upload/img"
                    beforeUpload={this.beforeUpload}
                    onStart={this.onStart}
                    data={this.getData}
                    onSuccess={this.onSuccess}
                    onProgress={this.onProgress}
                    onError={this.onError} >
                    <div className="upload_btns">
                        <img className="upload_btn" src="http://static.huocheju.com/web/top_upload_btn.png" alt="" />
                        <p>请上传图片{"{ jpg, png, gif, jpeg }"} Max:10MB</p>
                        <small>图片将完美压缩</small>
                    </div>
                </Upload>}
                {this.state.index === 1 && <div className="upload_box">
                    <div className="select_box">
                        <label htmlFor="select_file" className="select_label">
                            <input ref="select_file"
                                onChange={e => this.changeFile()}
                                type="file"
                                name="select_file"
                                accept={"image/*"}
                                id="select_file" />
                            <img className="upload_btn" src="http://static.huocheju.com/web/top_upload_btn.png" alt="" />
                            <p>请上传图片{"{ jpg, png, jpeg }"} Max:10MB</p>
                            <small>在线即可裁剪压缩</small>
                        </label>
                    </div>
                </div>}
            </div>
            <div className="tools">
                <div className="radio">
                    <div onClick={() => this.changeTab(0)} className={this.state.index === 0 ? "tab active" : "tab"}>压缩图片</div>
                    <div onClick={() => this.changeTab(1)} className={this.state.index === 1 ? "tab active" : "tab"}>裁剪图片</div>
                </div>
            </div>
            {this.state.index === 1 && !!this.state.imgSrc &&
                <div className="cropper_box">
                    <Cropper ref='cropper'
                        src={this.state.imgSrc}
                        style={{ height: 400, width: '100%' }}
                        guides={false}
                        aspectRatio={this.state.imgData.width / this.state.imgData.height}
                    />
                    <div className="cropper_bootom">
                        <label>宽：</label>
                        <input type="text" ref="imgW"
                            onInput={e => this.onDataChangeW(e)}
                            defaultValue={this.state.imgData.width} />
                        <label>高：</label>
                        <input type="text" ref="imgH"
                            onInput={e => this.onDataChangeH(e)}
                            defaultValue={this.state.imgData.height} />
                        <button onClick={() => this.uploadCropper()} className="cropper_btn">上传</button>
                    </div>
                </div>
            }
            <div className="file_list">
                {this.state.list.length === 0 && <Empty />}
                {this.state.list.map((item, index) => <div className="file_box" key={index}>
                    <img className="img" src={item.base64} alt="" />
                    {/* <div className="size">
                        {this.getSize(item.size)}
                    </div> */}
                    <Progress percent={Math.round(item.percent)} >
                        <span>{this.getSize(item.size)}</span>
                        {item.state === 0 && <span>等待</span>}
                        {item.state === 1 && <span>开始</span>}
                        {item.state === 2 && item.percent !== 100 && <span>{item.percent}%</span>}
                        {item.state === 2 && item.percent === 100 && <span>转码中</span>}
                        {item.state === 3 && <span>已减少{Math.round(100 - item.mini / item.size * 100)}%</span>}
                        <span></span>
                    </Progress>
                    <div className="txts">
                        {item.state === 3 && <a href={item.link + "?attname=" + this.getName(item.link)} target="_blank" rel="noopener noreferrer">下载{this.getSize(item.mini)}</a>}
                        {item.state === 4 && <span className="err">失败</span>}
                    </div>
                </div>)}
                {this.state.caches.length > 0 && <Fragment>
                    <h3>历史数据</h3>
                    <div className="cache_list">
                        {this.state.caches.map((item, index) => <div className="cache_item" key={index}>
                            <img className="cache_img" src={item.imgPath} alt="" />
                            <a href={item.imgPath + "?attname=" + this.getName(item.imgPath)} className="download">
                                <img src="http://static.huocheju.com/web/download2.png" alt="" />
                            </a>
                        </div>)}
                    </div>
                </Fragment>}
            </div>
            <div className="container">
                <div className="vs">
                    <div className="before">
                        <img src="http://img.bxiaob.top/web/img-before.jpg" alt="" />
                        <p>原图<span>137.76kb</span></p>
                    </div>
                    <div className="mid">
                        VS
                    </div>
                    <div className="after">
                        <img src="http://img.bxiaob.top/web/img-after.jpg" alt="" />
                        <p>压缩后<span>40.56kb</span></p>
                    </div>
                </div>
            </div>
            <div className="footer">
                <div className="info">
                    <p>
                        备用域名:&nbsp;&nbsp;<a href="http://www.9L9.cc">9l9.cc:迈阿密</a>&nbsp;&nbsp;<a href="http://mini.bxiaob.top">mini.bxiaob.top</a>&nbsp;&nbsp;<a href="http://mini.guofangchao.com">mini.guofangchao.com</a>
                    </p>
                </div>
                <div className="auther">
                    <p>
                        开源地址:&nbsp;&nbsp;<a href="https://github.com/cuo9958/img-mini" target="_blank" rel="noopener noreferrer">Github·web</a>&nbsp;&nbsp;<a href="https://github.com/cuo9958/img-mini-server" target="_blank" rel="noopener noreferrer">Github·server</a>
                    </p>
                </div>
            </div>
        </div>
    }

    getData = () => {
        return {
            uid: localStorage.getItem("uid") || ''
        }
    }
    getSize(size) {
        size = size / 1024;
        if (size < 1000) {
            return Math.round(size * 10) / 10 + "K";
        }
        size = size / 1024;
        if (size < 1000) {
            return Math.round(size * 10) / 10 + "M";
        }
        return '';
    }

    getName(url) {
        const names = url.split("/");
        const name = names[names.length - 1];
        if (name.indexOf(".") > 1) {
            return name;
        }
        return "mini-img.jpg";
    }

    onDrop = (acceptedFiles) => {
        console.log(acceptedFiles)
    }
    /**
     * 上传之前检测图片大小
     * name,size,uid
     */
    beforeUpload = async (file) => {
        console.log('准备', file);
        this.setState({
            list: this.state.list.concat({
                name: file.name,
                size: file.size,
                uid: file.uid,
                percent: 0,
                state: 0,
                mini: 1,
                link: '',
                base64: await getBase64(file)
            })
        })
    }
    /**
     * 上传开始展示开始样式
     */
    onStart = (file) => {
        console.log('开始', file);
        const list = this.state.list;
        list.forEach(item => {
            if (item.uid === file.uid) item.state = 1;
        })
        this.setState({ list });
    }

    onSuccess = (res, file) => {
        console.log('成功', res, file);
        const list = this.state.list;
        list.forEach(item => {
            if (item.uid === file.uid) {
                item.state = 3;
                item.link = res.data.url;
                item.mini = res.size;
            }
        })
        this.setState({ list });
        const imgTask = new ImgTask();
        imgTask.set("uid", this.uid);
        imgTask.set("imgPath", res.data.url);
        imgTask.save();
    }
    /**
     * percent
     * loaded
     * total
     */
    onProgress = (step, file) => {
        console.log('onProgress', step, file.name);
        const list = this.state.list;
        list.forEach(item => {
            if (item.uid === file.uid) {
                item.state = 2;
                item.percent = step.percent;
            }
        })
        this.setState({ list });
    }

    onError = (err, res, file) => {
        console.log('失败', err, file);
        const list = this.state.list;
        list.forEach(item => {
            if (item.uid === file.uid) item.state = 4;
        })
        this.setState({ list });
    }

    getUid = async () => {
        let uid = localStorage.getItem("uid");
        if (uid) return uid;
        try {
            const data = await Finger.getPromise();
            const values = data.map(function (c) { return c.value })
            uid = Finger.x64hash128(values.join(''), 31);
            localStorage.setItem("uid", uid);
            this.uid = uid;
            this.regUser();
            return uid;
        } catch (error) {
            return ""
        }
    }

    uid = ''
    async componentDidMount() {
        const uid = await this.getUid();
        if (!uid) return;
        this.uid = uid;

        this.getList();
    }

    regUser() {
        const user = new AV.User();
        user.setUsername(this.uid);
        user.setPassword('123');
        user.signUp();
    }

    changeTab(index) {
        this.setState({ index })
    }

    changeFile() {
        const files = this.refs.select_file.files;
        if (!files || files.length < 1) return;
        const fsreader = new FileReader();
        fsreader.onload = () => {
            this.setState({
                imgSrc: fsreader.result
            })
        }
        this.type = files[0].type
        fsreader.readAsDataURL(files[0]);
    }
    onDataChangeW(e) {
        const w = this.refs.imgW.value * 1;
        if (isNaN(w)) return;
        const imgData = this.state.imgData;
        imgData.width = w;
        this.setState({ imgData });
    }
    onDataChangeH(e) {
        const h = this.refs.imgH.value * 1;
        if (isNaN(h)) return;
        const imgData = this.state.imgData;
        imgData.height = h;
        this.setState({ imgData });
    }
    type = ''
    uploadCropper() {
        const data = this.refs.cropper.getCroppedCanvas().toDataURL(this.type);
        const uid = Date.now();
        this.setState({
            list: this.state.list.concat({
                name: 'test',
                size: data.length,
                uid,
                percent: 0,
                state: 0,
                mini: 1,
                link: '',
                base64: data
            })
        })
        const xhr = new XMLHttpRequest();
        const fd = new FormData();
        fd.append("file", this.convertBase64UrlToBlob(data));
        fd.append("uid", localStorage.getItem("uid") || '');
        xhr.open('POST', '/api/upload/img')
        xhr.onload = () => {
            // this.onSuccess()
            const res = JSON.parse(xhr.responseText);
            console.log(res)
            this.onSuccess(res, { uid });
        }
        xhr.upload.onprogress = (e) => {
            this.onProgress({ percent: e.loaded / e.total * 100 }, { name: 'test', uid });
        }
        xhr.send(fd)
    }
    convertBase64UrlToBlob(urlData) {
        let arr = urlData.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }
    async getList() {
        const ImgQuery1 = new AV.Query('ImgTask');
        ImgQuery1.equalTo('uid', this.uid);

        const ImgQuery2 = new AV.Query('ImgTask');
        ImgQuery2.greaterThanOrEqualTo('createdAt', new Date(Date.now() - 86400000));

        const ImgQuery = AV.Query.and(ImgQuery1, ImgQuery2);
        ImgQuery.limit(20);

        let list = await ImgQuery.find();
        list = list.map(item => {
            return {
                imgPath: item.attributes.imgPath,
                create: item.createdAt
            }
        });
        this.setState({ caches: list });
    }
}
