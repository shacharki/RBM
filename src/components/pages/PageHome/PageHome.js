import React from "react";
import Grid from "@material-ui/core/Grid";
import {Button} from "@material-ui/core";
import {Link} from "react-router-dom";
import './PageHome.css'
import {auth} from "../../../firebase/firebase";
import * as docx from "docx";

import { saveAs } from "file-saver";
import {Footer, Header, Paragraph} from "docx";


class PageHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};


    }

    async componentDidMount() {
        await auth.onAuthStateChanged(user => {
            if (user) {
                this.setState({user: user})
            }
        })
    }

    render() {
        return (
            <div id="instructor" className="sec-design" dir='rtl'>
                <div id="instructor_menu" className="form-design" name="student_form">
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <div>

                                <Button
                                    type="submit"
                                    style={{style: {margin: '10px'}}}
                                    fullWidth
                                    variant="contained"
                                    id="LoginBtn"
                                    onClick={() => {
                                        if (this.state.user) {
                                            this.props.history.push({
                                                pathname: '/User',
                                                data: this.state.user // your data array of objects
                                            })
                                        } else {
                                            this.props.history.push({
                                                pathname: '/Login',
                                            })
                                        }
                                    }}>
                                    כניסת משתמשים
                                </Button>
                            </div>
                        </Grid>
                        <Grid item xs={12}>
                            <div>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    id="registerBtn"
                                    component={Link}
                                    to="/SignUp">
                                    הרשמה
                                </Button>
                            </div>
                        </Grid>
                        <Grid item xs={12}>
                            <div>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    onClick={() => {
                                      this.generate()
                                    }}>
                                    הורדת קובץ
                                </Button>
                            </div>
                        </Grid>
                    </Grid>
                </div>

            </div>
        )
    }


    generate() {
        const doc = new docx.Document();


        doc.addSection({
            properties: {},
            headers: {
                default: new Header({
                    // children: [new Paragraph("Header text")],
                    children: [ new Paragraph("image1")],
                }),
            },
            footers: {
                default: new Footer({
                    children: [new Paragraph("Footer text")],
                }),
            },
            children: [
                new Paragraph({
                    children: [
                        new docx.TextRun("Hello World"),
                        new docx.TextRun({
                            text: "Foo Bar",
                            bold: true,
                        }),

                    ],

                }),
                new Paragraph({
                    children: [
                        new docx.TextRun({
                            text: "\tGithub is the best",
                            bold: true,
                        }),

                    ],

                }),

            ],
        });

        docx.Packer.toBlob(doc).then(blob => {
            console.log(blob);
            saveAs(blob, "example.doc");
            console.log("Document created successfully");


        });
    }
}

export  default  PageHome;