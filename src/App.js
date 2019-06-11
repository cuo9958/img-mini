import React, { Fragment } from 'react';
import Upload from 'rc-upload'
// import request from './utils/request'
import { Progress, Empty } from 'antd';
import AV from 'leancloud-storage';
import Finger from "fingerprintjs2";

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
            caches: []
        }
    }

    render() {

        return <div>
            <div className="top_box">
                <img className="bg" src="http://static.huocheju.com/web/top_bg.jpg" alt="" />
                <Upload type="drag" className="upload_box"
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
                </Upload>
            </div>

            <div className="file_list">
                {this.state.list.length === 0 && <Empty className="empty_box" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                {this.state.list.map((item, index) => <div className="file_box" key={index}>
                    <img className="img" src={item.base64} alt="" />
                    <div className="size">
                        {this.getSize(item.size)}
                    </div>
                    <Progress
                        strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                        }}
                        showInfo={false}
                        status="active"
                        strokeLinecap="square"
                        percent={Math.round(item.percent)}
                    // percent={50}
                    />
                    <div className="txts">
                        {item.state === 0 && <span>等待</span>}
                        {item.state === 1 && <span>开始</span>}
                        {item.state === 2 && item.percent !== 100 && <span>上传{item.percent}%</span>}
                        {item.state === 2 && item.percent === 100 && <span>转码中</span>}
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
            <div className="footer">
                <p>
                    备用域名:&nbsp;&nbsp;<a href="http://mini.guofangchao.com">mini.guofangchao.com</a>&nbsp;&nbsp;<a href="http://mini.bxiaob.top">mini.bxiaob.top</a>
                </p>
                <p>
                    开源地址:&nbsp;&nbsp;<a href="https://github.com/cuo9958/img-mini" target="_blank" rel="noopener noreferrer">Github·web</a>
                </p>
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
