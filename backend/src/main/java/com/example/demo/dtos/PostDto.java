package com.example.demo.dtos;

public class PostDto {
    private String createrNAme;
    private String createrId;
    private String content;

    public String getCreaterName() {
        return this.createrNAme;
    }

    public String getcreaterId() {
        return this.createrId;
    }

    public String getContent() {
        return this.content;
    }

    public void setCreaterName(String name) {
        this.createrNAme = name;
    }

    public void setCreaterId(String id) {
        this.createrNAme = id;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
