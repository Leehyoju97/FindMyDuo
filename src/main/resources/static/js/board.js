import {jwtToAccountId} from "./jwt-to-accountid.js";
import {isValidateToken} from "./keep-access-token.js";

let token = localStorage.getItem('token');

new Vue({
    el: "#board-app",
    data: {
        board: {},
        boardId: '',
        comments: [],
        images: [],
        accountId: '',
        isAuthorizedUser: false, // 작성자인지 체크
        isUnAuthorizedUser: false, // 작성자 아닌지 체크(신고)
        isLike: '',
        isBookmark: '',
        nickName: ''
    },
    async created() {
        const url = window.location.href.split("/");
        this.boardId = url[url.length - 1];

        axios.get('/board/' + this.boardId)
            .then(response => {
                this.board = response.data;
                this.nickName = response.data.nickName;
                this.comments = response.data.comments;
                this.images = response.data.images;
                this.accountId = response.data.accountId;

                if (this.accountId === jwtToAccountId() && jwtToAccountId !== null) {
                    this.isAuthorizedUser = true;
                }

                if (this.accountId !== jwtToAccountId() && jwtToAccountId() !== null) {
                    this.isUnAuthorizedUser = true;
                }
            })
            .catch((error) => {
                alert(error.response.data.message);
                location.href = '/board/view';
            });
    },
    methods: {
        // 게시판 수정버튼 클릭시 수정페이지로
        async redirectToEditPage() {
            location.href = '/board/form/' + this.boardId;
        },
        // 게시판 삭제
        async deleteBoard() {
            if (confirm('게시글을 삭제하시겠습니까?')) {
                token = await isValidateToken()
                await axios.delete('/board/' + this.boardId, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                })
                    .then(response => {
                        alert('게시글이 삭제되었습니다.');
                        location.href = '/board/view';
                    })
                    .catch(error => {
                        alert('게시글 삭제 실패' + error);
                    })
            }
        },
        // 좋아요
        async likeBoard() {
            const url = '/board/' + this.boardId + '/like';
            token = await isValidateToken()
            await axios.post(url,{}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            })
                .then(response => {
                    this.isLike = response.data.message;

                    if (this.isLike == '좋아요 처리 완료') {
                        alert('좋아요 처리 완료');
                    }

                    if (this.isLike == '좋아요 취소 완료') {
                        alert('좋아요 취소 완료');
                    }
                })
        },
        // 즐겨찾기
        async bookmarkBoard() {
            const url = '/board/' + this.boardId + '/bookmark';
            token = await isValidateToken()
            await axios.post(url,{}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            })
                .then(response => {
                    this.isBookmark = response.data.message;

                    if (this.isBookmark == '즐겨찾기 처리완료') {
                        alert('즐겨찾기 처리완료');
                    }

                    if (this.isBookmark == '즐겨찾기 취소완료') {
                        alert('즐겨찾기 취소완료');
                    }
                })
        },
        // 신고
        async reportBoard() {
            const url = '/board/' + this.boardId + '/report';
            const message = prompt();
            token = await isValidateToken()
            await axios.post(url,{'content': message}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            })
                .then(response => {
                    console.log(this.boardId);
                    console.log(url);
                    alert('신고');
                })
        },
        // 댓글 작성
        async inputComment() {
            const url = '/board/' + this.boardId + '/comment';
            const content = document.getElementById("content").value
            token = await isValidateToken()
            await axios.post(url, {'content': content}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            })
                .then(response => {
                    this.nickname = response.data.nickname;
                    alert(this.nickname + '님 댓글 작성 완료');
                    location.href = '/board/view/' + this.boardId;
                })
        },
        // 댓글 삭제
        async deleteComment(commentId, nickname) {
            const url = '/board/' + this.boardId + '/comment/' + commentId;

            if (confirm('댓글을 삭제하시겠습니까?')) {
                token = await isValidateToken()
                await axios.delete(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                })
                    .then(response => {
                        if (this.nickname === nickname && jwtToAccountId !== null) {
                            console.log('댓글 삭제 완료');
                            alert('댓글 삭제 완료');
                            location.href = '/board/view/' + this.boardId;
                        }
                    })
            }
        },
        isCommentAuthor(commentNickname) {
            const userNickname = localStorage.getItem('nickname');
            console.log(userNickname);
            return userNickname === commentNickname;
        }
    },
});