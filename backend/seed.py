"""
샘플 데이터 삽입 스크립트.

실행:
    python seed.py
"""

from app.database import engine, Base, SessionLocal
from app import models
from datetime import datetime, timezone, timedelta
import random

def seed():
    # 테이블 생성
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 이미 데이터가 있으면 스킵
        if db.query(models.User).count() > 0:
            print("⚠️  이미 샘플 데이터가 있습니다. 스킵합니다.")
            return

        # ── 1. 유저 10명 ──────────────────────────────────────
        users = [
            models.User(nickname=f"user_{i}", email=f"user{i}@example.com", password="hashed_password")
            for i in range(1, 11)
        ]
        db.add_all(users)
        db.commit()
        for u in users:
            db.refresh(u)
        print(f"✅ 유저 {len(users)}명 삽입 완료")

        # ── 2. 영상 10개 ──────────────────────────────────────
        video_data = [
            ("딥페이크 영상 분석 #1",  "https://youtube.com/watch?v=sample1",  "딥페이크,AI,분석"),
            ("뉴스 클립 진위 확인",    "https://youtube.com/watch?v=sample2",  "뉴스,정치,검증"),
            ("AI 생성 광고 영상",      "https://youtube.com/watch?v=sample3",  "광고,AI생성"),
            ("유명인 딥페이크 의혹",   "https://youtube.com/watch?v=sample4",  "딥페이크,유명인"),
            ("선거 관련 조작 영상",    "https://youtube.com/watch?v=sample5",  "선거,조작,정치"),
            ("SNS 바이럴 영상",        "https://youtube.com/watch?v=sample6",  "SNS,바이럴"),
            ("AI 합성 뮤직비디오",     "https://youtube.com/watch?v=sample7",  "음악,AI합성"),
            ("스포츠 하이라이트 검증", "https://youtube.com/watch?v=sample8",  "스포츠,검증"),
            ("인터뷰 영상 조작 의혹",  "https://youtube.com/watch?v=sample9",  "인터뷰,조작"),
            ("자연재해 현장 영상",     "https://youtube.com/watch?v=sample10", "재해,현장,뉴스"),
        ]
        videos = [
            models.Video(title=title, url=url, keyword=keyword)
            for title, url, keyword in video_data
        ]
        db.add_all(videos)
        db.commit()
        for v in videos:
            db.refresh(v)
        print(f"✅ 영상 {len(videos)}개 삽입 완료")

        # ── 3. 판독 기록 10개 ─────────────────────────────────
        logs = []
        for i in range(10):
            prob = round(random.uniform(0.1, 0.99), 2)
            logs.append(models.DetectionLog(
                video_id=videos[i].id,
                user_id=users[i % len(users)].id,
                ai_probability=prob,
                is_ai_generated=prob >= 0.5,
                detected_at=datetime.now(timezone.utc) - timedelta(days=i),
            ))
        db.add_all(logs)
        db.commit()
        print(f"✅ 판독 기록 {len(logs)}개 삽입 완료")

        print("\n🎉 샘플 데이터 삽입 완료!")

    except Exception as e:
        db.rollback()
        print(f"❌ 오류 발생: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()