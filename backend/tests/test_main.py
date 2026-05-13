from app.main import ensure_indexes


class FakeCollection:
    def __init__(self):
        self.indexes = []

    async def create_index(self, *args, **kwargs):
        self.indexes.append((args, kwargs))


class FakeDb:
    def __init__(self):
        self.clients = FakeCollection()
        self.threads = FakeCollection()
        self.messages = FakeCollection()
        self.cases = FakeCollection()


async def test_gmail_message_id_partial_index_uses_supported_expression():
    db = FakeDb()

    await ensure_indexes(db)

    _, options = db.messages.indexes[-1]
    partial_filter = options["partialFilterExpression"]
    gmail_filter = partial_filter["gmail_message_id"]

    assert options["unique"] is True
    assert gmail_filter == {"$type": "string", "$gt": ""}
    assert "$ne" not in gmail_filter
